import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

/* =====================================================
   ALERT — inline banner for success / error / warning
   Usage: <Alert type="error">{message}</Alert>
===================================================== */
const CONFIG = {
  success: {
    icon: CheckCircle2,
    classes: "bg-success-bg text-success dark:bg-success-bgDark dark:text-success",
  },
  error: {
    icon: XCircle,
    classes: "bg-danger-bg text-danger dark:bg-danger-bgDark dark:text-danger",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-warning-bg text-warning dark:bg-warning-bgDark dark:text-warning",
  },
};

function Alert({ type = "error", children, className = "" }) {
  const { icon: Icon, classes } = CONFIG[type] || CONFIG.error;

  return (
    <div className={`mb-4 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ${classes} ${className}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default Alert;
