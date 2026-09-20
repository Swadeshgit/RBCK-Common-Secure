import bcrypt from "bcryptjs";
import { User, Role, UserPermission } from "../models/index.js";
import {
  getUserAccessUnion,
  checkEscalation,
} from "../utils/permissionHelper.js";

/* =====================================================
   CREATE STAFF (subAdmin)
   POST /api/staff   (protected)
   Body: { name, email, password, phone, roleId, access }

   roleId select karne par uski defaultPermissions "access"
   ke saath merge/override ho sakti hain — agar access bheja
   gaya hai to wahi use hoga (customized), warna roleId ki
   defaultPermissions copy ho jaayengi.
===================================================== */
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, roleId, access, scopeIds } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, password required" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    let finalAccess = access;

    /* Agar explicit access nahi diya, to roleId ki defaultPermissions se banao */
    if (!finalAccess && roleId) {
      const role = await Role.findOne({ _id: roleId, isDeleted: false });
      if (!role) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found" });
      }
      finalAccess = [
        {
          scopeIds: scopeIds || [],
          permissions: role.defaultPermissions,
        },
      ];
    }

    if (!finalAccess || finalAccess.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Either roleId or access[] must be provided",
        });
    }

    /* ========== ESCALATION CHECK ========== */
    const requesterUnion = await getUserAccessUnion(
      req.user.id,
      req.user.userType,
    );
    const escalationError = checkEscalation(requesterUnion, finalAccess);
    if (escalationError) {
      return res.status(403).json({ success: false, message: escalationError });
    }
    /* ========== END ESCALATION CHECK ========== */

    const hashedPassword = await bcrypt.hash(password, 10);
    const orgId = req.user.orgId;

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      userType: "subAdmin",
      roleId: roleId || null,
      mainOrgId: orgId,
      currentOrgId: orgId,
      createdBy: req.user.id,
    });

    await UserPermission.create({
      userId: staff._id,
      orgId,
      roleId: roleId || null,
      access: finalAccess,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        roleId: staff.roleId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET STAFF LIST
   GET /api/staff   (protected)
===================================================== */
export const getStaffList = async (req, res, next) => {
  try {
    const orgId = req.user.orgId;

    const staff = await User.find({
      mainOrgId: orgId,
      userType: "subAdmin",
      isDeleted: false,
    })
      .select("-password")
      .populate("roleId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   TOGGLE STAFF ACTIVE
   PUT /api/staff/:id/toggle-active   (protected)
===================================================== */
export const toggleStaffActive = async (req, res, next) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      userType: "subAdmin",
      isDeleted: false,
    });
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    staff.isActive = !staff.isActive;
    staff.tokenVersion += 1; // deactivate hote hi turant session invalid
    await staff.save();

    return res
      .status(200)
      .json({
        success: true,
        message: `Staff ${staff.isActive ? "activated" : "deactivated"}`,
        staff,
      });
  } catch (error) {
    next(error);
  }
};
