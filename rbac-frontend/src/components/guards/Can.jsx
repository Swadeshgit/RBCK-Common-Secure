import { usePermission } from "../../context/PermissionContext.jsx";

/* =====================================================
   CAN — inline UI-element permission wrapper
   Usage: <Can module="Staff" action="create"><Button>Add Staff</Button></Can>
   Permission nahi hai to andar ka content render hi nahi hota.
   Unchanged — no visible text here to translate.
===================================================== */
function Can({ module, action, scopeId = null, children, fallback = null }) {
  const { can } = usePermission();

  if (!can(module, action, scopeId)) {
    return fallback;
  }

  return children;
}

export default Can;
