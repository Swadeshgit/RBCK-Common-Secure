import { UserPermission } from "../models/index.js";

/* =====================================================
   GET USER ACCESS UNION
   Requester ke saare access-blocks ko combine karke
   ek union nikalta hai — escalation-check aur quick
   lookups dono ke kaam aata hai.

   superAdmin ke liye null return hota hai = "full access",
   koi restriction check nahi hoga.
===================================================== */
export const getUserAccessUnion = async (userId, userType) => {
  if (userType === "superAdmin") return null;

  const permDoc = await UserPermission.findOne({
    userId,
    isDeleted: false,
    isActive: true,
  });
  if (!permDoc) return { scopeIds: new Set(), permissionsMap: {} };

  const scopeIds = new Set();
  const permissionsMap = {}; // { "Module:action": true }

  permDoc.access.forEach((block) => {
    block.scopeIds.forEach((id) => scopeIds.add(String(id)));
    block.permissions.forEach((p) => {
      const actionsObj =
        p.actions instanceof Map ? Object.fromEntries(p.actions) : p.actions;
      Object.entries(actionsObj || {}).forEach(([action, allowed]) => {
        if (allowed) permissionsMap[`${p.module}:${action}`] = true;
      });
    });
  });

  return { scopeIds, permissionsMap };
};

/* =====================================================
   HAS PERMISSION — ek specific module:action:scope check
   currentScopeId optional hai — jo project scope use nahi
   karta, wahan null bhej sakte hain (sirf module:action check hoga)
===================================================== */
export const hasPermission = async (
  userId,
  userType,
  module,
  action,
  currentScopeId = null,
) => {
  if (userType === "superAdmin") return true;

  const permDoc = await UserPermission.findOne({
    userId,
    isDeleted: false,
    isActive: true,
  });
  if (!permDoc) return false;

  return permDoc.access.some((block) => {
    if (currentScopeId) {
      const scopeMatch = block.scopeIds.some(
        (id) => String(id) === String(currentScopeId),
      );
      if (!scopeMatch) return false;
    }
    const modulePermission = block.permissions.find((p) => p.module === module);
    const actionsObj =
      modulePermission?.actions instanceof Map
        ? Object.fromEntries(modulePermission.actions)
        : modulePermission?.actions;
    return Boolean(actionsObj?.[action]);
  });
};

/* =====================================================
   ESCALATION CHECK
   Requester apne se zyada access kisi ko de nahi sakta.
   Returns: null (ok) ya ek error-message string (fail)
===================================================== */
export const checkEscalation = (requesterUnion, incomingAccess) => {
  if (!requesterUnion) return null; // superAdmin — no restriction

  for (const block of incomingAccess) {
    for (const scopeId of block.scopeIds || []) {
      if (!requesterUnion.scopeIds.has(String(scopeId))) {
        return "You cannot grant access to a scope you don't have yourself";
      }
    }
    for (const perm of block.permissions || []) {
      for (const [action, allowed] of Object.entries(perm.actions || {})) {
        if (
          allowed &&
          !requesterUnion.permissionsMap[`${perm.module}:${action}`]
        ) {
          return `You cannot grant "${perm.module}: ${action}" — you don't have it yourself`;
        }
      }
    }
  }
  return null;
};
 