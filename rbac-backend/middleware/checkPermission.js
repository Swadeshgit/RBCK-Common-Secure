import { hasPermission } from "../utils/permissionHelper.js";

/* =====================================================
   CHECK PERMISSION MIDDLEWARE
   Usage: router.delete("/:id", protect, checkPermission("Product", "delete"), deleteProduct)

   currentScopeId req.user.scopeId (JWT) se aata hai by default,
   lekin request body/query se override bhi allow karte hain
   (jaise ek dropdown-select wale form me scope alag se bheja ja sakta hai)
===================================================== */
export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const scopeId =
        req.body?.scopeId || req.query?.scopeId || req.user.scopeId || null;

      const allowed = await hasPermission(
        req.user.id,
        req.user.userType,
        module,
        action,
        scopeId,
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `You don't have "${action}" permission for "${module}"`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
