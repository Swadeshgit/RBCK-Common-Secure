import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getMyPermissionsApi } from "../api/staffApi.js";
import { useAuth } from "./AuthContext.jsx";

/* =====================================================
   PERMISSION CONTEXT
   User login hote hi uski permissions fetch karke yahan
   store karta hai. Poore app me `can(module, action)`
   function se hi check hoga ki UI dikhani hai ya nahi,
   route allow karna hai ya nahi.
===================================================== */
const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { user } = useAuth();

  const [access, setAccess] = useState([]); // array of { scopeIds, permissions }
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState(null);
  const [permLoading, setPermLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setAccess([]);
      setIsSuperAdmin(false);
      setRole(null);
      setPermLoading(false);
      return;
    }

    try {
      setPermLoading(true);
      const res = await getMyPermissionsApi();

      if (res.data.isSuperAdmin) {
        setIsSuperAdmin(true);
        setAccess([]);
        setRole(null);
      } else {
        setIsSuperAdmin(false);
        setAccess(res.data.access || []);
        setRole(res.data.role || null);
      }
    } catch (error) {
      setAccess([]);
      setIsSuperAdmin(false);
    } finally {
      setPermLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const can = (module, action, scopeId = null) => {
    if (isSuperAdmin) return true;
    if (!access || access.length === 0) return false;

    const effectiveScopeId = scopeId || user?.currentScopeId;

    return access.some((block) => {
      if (effectiveScopeId) {
        const scopeMatch = block.scopeIds?.some(
          (id) => String(id) === String(effectiveScopeId),
        );
        if (!scopeMatch) return false;
      }

      const modulePermission = block.permissions?.find(
        (p) => p.module === module,
      );
      return Boolean(modulePermission?.actions?.[action]);
    });
  };

  const canAny = (module, scopeId = null) => {
    if (isSuperAdmin) return true;
    const effectiveScopeId = scopeId || user?.currentScopeId;

    return access.some((block) => {
      if (effectiveScopeId) {
        const scopeMatch = block.scopeIds?.some(
          (id) => String(id) === String(effectiveScopeId),
        );
        if (!scopeMatch) return false;
      }
      const modulePermission = block.permissions?.find(
        (p) => p.module === module,
      );
      if (!modulePermission?.actions) return false;
      return Object.values(modulePermission.actions).some((v) => v === true);
    });
  };

  return (
    <PermissionContext.Provider
      value={{
        access,
        isSuperAdmin,
        role,
        permLoading,
        can,
        canAny,
        refetchPermissions: fetchPermissions,
      }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermission = () => useContext(PermissionContext);
