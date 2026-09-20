import { Scope, Organization, UserPermission, User } from "../models/index.js";
import { generateToken } from "../utils/tokenHelper.js";

/* =====================================================
   CREATE SCOPE (branch/warehouse/department — project-dependent)
   POST /api/scopes   (protected, superAdmin only)
===================================================== */
export const createScope = async (req, res, next) => {
  try {
    const { name, code, orgId, parentScopeId, address, contact } = req.body;

    if (!name || !orgId) {
      return res
        .status(400)
        .json({ success: false, message: "name and orgId are required" });
    }

    const org = await Organization.findOne({
      _id: orgId,
      createdBy: req.user.id,
      isDeleted: false,
    });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const existingCount = await Scope.countDocuments({
      orgId,
      parentScopeId: parentScopeId || null,
      isDeleted: false,
    });
    const isMain = existingCount === 0;

    const scope = await Scope.create({
      name,
      code,
      orgId,
      parentScopeId: parentScopeId || null,
      isMain,
      createdBy: req.user.id,
      address,
      contact,
    });

    return res
      .status(201)
      .json({ success: true, message: "Scope created successfully", scope });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET SCOPES (by organization)
   GET /api/scopes?orgId=...   (protected)
===================================================== */
export const getScopes = async (req, res, next) => {
  try {
    const { orgId } = req.query;
    if (!orgId) {
      return res
        .status(400)
        .json({ success: false, message: "orgId query param is required" });
    }

    const scopes = await Scope.find({ orgId, isDeleted: false }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json({ success: true, count: scopes.length, scopes });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   SWITCH SCOPE
   PUT /api/scopes/switch/:id   (protected — superAdmin ya subAdmin dono)

   superAdmin: apni org ke andar koi bhi scope switch kar sakta hai
   subAdmin: sirf wahi scope switch kar sakta hai jo uski
             UserPermission.access[*].scopeIds me mojood ho
===================================================== */
export const switchScope = async (req, res, next) => {
  try {
    const scope = await Scope.findOne({ _id: req.params.id, isDeleted: false });
    if (!scope) {
      return res
        .status(404)
        .json({ success: false, message: "Scope not found" });
    }

    if (req.user.userType === "superAdmin") {
      const org = await Organization.findOne({
        _id: scope.orgId,
        createdBy: req.user.id,
      });
      if (!org) {
        return res
          .status(403)
          .json({
            success: false,
            message: "This scope doesn't belong to your organization",
          });
      }
    } else {
      const permDoc = await UserPermission.findOne({
        userId: req.user.id,
        isDeleted: false,
        isActive: true,
      });
      const allowed = permDoc?.access.some((block) =>
        block.scopeIds.some((id) => String(id) === String(scope._id)),
      );
      if (!allowed) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You don't have access to this scope",
          });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { currentScopeId: scope._id },
      { new: true },
    );
    const newToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Switched to ${scope.name}`,
      currentScopeId: scope._id,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};
