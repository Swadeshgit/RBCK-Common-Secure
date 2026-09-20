import { Role, Module, UserPermission, User } from "../models/index.js";

/* =====================================================
   HELPER — incoming permissions ko valid Module list ke
   against validate karo (galat module/action reject)
===================================================== */
const validatePermissionsAgainstModules = async (permissions) => {
  const modules = await Module.find({ isActive: true });
  const moduleMap = {};
  modules.forEach((m) => (moduleMap[m.name] = m.actions));

  for (const p of permissions || []) {
    if (!moduleMap[p.module]) {
      return `Invalid module: "${p.module}"`;
    }
    for (const action of Object.keys(p.actions || {})) {
      if (!moduleMap[p.module].includes(action)) {
        return `Invalid action "${action}" for module "${p.module}"`;
      }
    }
  }
  return null;
};

/* =====================================================
   CREATE ROLE (dynamic — koi bhi naam: Teacher, Manager, etc.)
   POST /api/roles   (protected, superAdmin only)
   Body: { name, orgId, defaultPermissions: [{ module, actions }] }
===================================================== */
export const createRole = async (req, res, next) => {
  try {
    const { name, orgId, defaultPermissions } = req.body;

    if (!name || !orgId) {
      return res
        .status(400)
        .json({ success: false, message: "name and orgId are required" });
    }

    const validationError =
      await validatePermissionsAgainstModules(defaultPermissions);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const existing = await Role.findOne({ name, orgId, isDeleted: false });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Role with this name already exists in this organization",
        });
    }

    const role = await Role.create({
      name,
      orgId,
      defaultPermissions: defaultPermissions || [],
      createdBy: req.user.id,
    });

    return res
      .status(201)
      .json({ success: true, message: "Role created successfully", role });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET ROLES (by organization)
   GET /api/roles?orgId=...   (protected)
===================================================== */
export const getRoles = async (req, res, next) => {
  try {
    const { orgId } = req.query;
    if (!orgId) {
      return res
        .status(400)
        .json({ success: false, message: "orgId query param is required" });
    }

    const roles = await Role.find({ orgId, isDeleted: false }).sort({
      name: 1,
    });

    return res.status(200).json({ success: true, count: roles.length, roles });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   UPDATE ROLE
   PUT /api/roles/:id   (protected, superAdmin only)

   Note: existing subAdmins jinke paas ye role hai, unki
   UserPermission automatically update NAHI hoti — kyunki
   wo already customize ho chuki ho sakti hai. Role sirf
   "template for future assignment" hai.
===================================================== */
export const updateRole = async (req, res, next) => {
  try {
    const { name, defaultPermissions } = req.body;

    if (defaultPermissions) {
      const validationError =
        await validatePermissionsAgainstModules(defaultPermissions);
      if (validationError) {
        return res
          .status(400)
          .json({ success: false, message: validationError });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (defaultPermissions !== undefined)
      updates.defaultPermissions = defaultPermissions;

    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Role updated", role });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   DELETE ROLE
   DELETE /api/roles/:id   (protected, superAdmin only)
   Agar koi subAdmin isi role ka use kar raha hai to block
   kar do — pehle unko dusra role do
===================================================== */
export const deleteRole = async (req, res, next) => {
  try {
    const inUseCount = await User.countDocuments({
      roleId: req.params.id,
      isDeleted: false,
    });
    if (inUseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${inUseCount} user(s) currently assigned to this role`,
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res.status(200).json({ success: true, message: "Role deleted" });
  } catch (error) {
    next(error);
  }
};
