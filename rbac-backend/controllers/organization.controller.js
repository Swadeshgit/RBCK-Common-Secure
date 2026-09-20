import { Organization, Scope, User } from "../models/index.js";
import { generateToken } from "../utils/tokenHelper.js";

/* =====================================================
   CREATE ORGANIZATION
   POST /api/organizations   (protected, superAdmin only)
   Pehla organization automatically "current" ban jaata hai
   aur User.mainOrgId set ho jaata hai.
===================================================== */
export const createOrganization = async (req, res, next) => {
  try {
    const { name, code, domain, address, contact } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Organization name is required" });
    }

    const existingCount = await Organization.countDocuments({
      createdBy: req.user.id,
      isDeleted: false,
    });
    const isFirst = existingCount === 0;

    const org = await Organization.create({
      name,
      code,
      domain,
      address,
      contact,
      createdBy: req.user.id,
      ownerId: req.user.id,
    });

    let updatedUser = null;
    if (isFirst) {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { mainOrgId: org._id, currentOrgId: org._id },
        { new: true },
      );
    }

    /* orgId token me tha null/different — naya token issue karo */
    const tokenUser = updatedUser || (await User.findById(req.user.id));
    const newToken = generateToken(tokenUser);

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization: org,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET MY ORGANIZATIONS
   GET /api/organizations   (protected)
===================================================== */
export const getMyOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({
      createdBy: req.user.id,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json({ success: true, count: orgs.length, organizations: orgs });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   UPDATE ORGANIZATION
   PUT /api/organizations/:id   (protected, superAdmin only)
===================================================== */
export const updateOrganization = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "code",
      "domain",
      "logo",
      "address",
      "contact",
      "status",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const org = await Organization.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Organization updated",
        organization: org,
      });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   SWITCH ORGANIZATION (superAdmin — multi-org context change)
   PUT /api/organizations/switch/:id   (protected, superAdmin only)
===================================================== */
export const switchOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      isDeleted: false,
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { currentOrgId: org._id, currentScopeId: null }, // scope reset — naye org me pehle se koi scope select nahi
      { new: true },
    );

    const newToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Switched to ${org.name}`,
      currentOrgId: org._id,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};
