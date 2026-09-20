import { User, UserPermission, Role } from "../models/index.js";
import {
  getUserAccessUnion,
  checkEscalation,
} from "../utils/permissionHelper.js";
import { emitToUser } from "../sockets/index.js";

/* =====================================================
   ASSIGN / UPDATE PERMISSION
   PUT /api/user-permission/:subAdminUserId   (protected)
   Body: { roleId (optional), access: [{ scopeIds, permissions }] }

   Escalation-check: requester (agar khud subAdmin hai,
   superAdmin nahi) apne se zyada access kisi ko nahi de sakta.

   tokenVersion++ bhi yahi hota hai — target user ka purana
   session turant invalid, naya permission turant apply.
===================================================== */
export const assignPermission = async (req, res, next) => {
  try {
    const { subAdminUserId } = req.params;
    const { roleId, access } = req.body;

    if (!Array.isArray(access) || access.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "access[] is required" });
    }

    const targetUser = await User.findOne({
      _id: subAdminUserId,
      userType: "subAdmin",
      isDeleted: false,
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    /* Agar roleId diya hai to verify karo wo valid role hai */
    if (roleId) {
      const role = await Role.findOne({ _id: roleId, isDeleted: false });
      if (!role) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found" });
      }
    }

    /* ========== ESCALATION CHECK ========== */
    const requesterUnion = await getUserAccessUnion(
      req.user.id,
      req.user.userType,
    );
    const escalationError = checkEscalation(requesterUnion, access);
    if (escalationError) {
      return res.status(403).json({ success: false, message: escalationError });
    }
    /* ========== END ESCALATION CHECK ========== */

    const permDoc = await UserPermission.findOneAndUpdate(
      { userId: subAdminUserId },
      {
        $set: {
          userId: subAdminUserId,
          orgId: targetUser.currentOrgId || targetUser.mainOrgId,
          roleId: roleId || null,
          access,
          createdBy: req.user.id,
          isActive: true,
          isDeleted: false,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    /* roleId bhi User doc pe update karo (display/reference ke liye) */
    if (roleId !== undefined) {
      targetUser.roleId = roleId || null;
    }
    targetUser.tokenVersion += 1; // force re-login taaki naya permission turant lagu ho
    await targetUser.save();

    /* Real-time — target subAdmin ko turant inform karo */
    const io = req.app.get("io");
    if (io) {
      emitToUser(io, subAdminUserId, "permission:updated", {
        permission: permDoc,
      });
      emitToUser(io, subAdminUserId, "auth:forceLoggedOut", {
        reason: "Your permissions were updated. Please login again.",
      });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Permissions assigned",
        permission: permDoc,
      });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET PERMISSION BY USER
   GET /api/user-permission/:subAdminUserId   (protected)
===================================================== */
export const getPermissionByUser = async (req, res, next) => {
  try {
    const permission = await UserPermission.findOne({
      userId: req.params.subAdminUserId,
      isDeleted: false,
    }).populate("roleId", "name");

    return res
      .status(200)
      .json({ success: true, permission: permission || { access: [] } });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET MY PERMISSIONS
   GET /api/user-permission/me   (protected)
   Frontend login ke baad ye call karega — PermissionContext
   isi se populate hoga.
===================================================== */
export const getMyPermissions = async (req, res, next) => {
  try {
    if (req.user.userType === "superAdmin") {
      return res
        .status(200)
        .json({ success: true, isSuperAdmin: true, access: "FULL" });
    }

    const permission = await UserPermission.findOne({
      userId: req.user.id,
      isDeleted: false,
      isActive: true,
    }).populate("roleId", "name");

    return res.status(200).json({
      success: true,
      isSuperAdmin: false,
      role: permission?.roleId || null,
      access: permission?.access || [],
    });
  } catch (error) {
    next(error);
  }
};
