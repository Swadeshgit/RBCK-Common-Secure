/* =====================================================
   BUTTON — reusable, variant-based
   Usage: <Button variant="primary" onClick={...}>Save</Button>
   Variants: primary, secondary, danger, outline
   API unchanged — only visual treatment upgraded.
===================================================== */
function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) {
  const baseStyle =
    "relative text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 ease-out-soft " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 " +
    "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";

  const variants = {
    primary:
      "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md",
    secondary:
      "bg-ink/5 text-ink hover:bg-ink/10 dark:bg-white/10 dark:text-ink-inverse dark:hover:bg-white/15",
    danger:
      "bg-danger text-white shadow-sm hover:bg-danger/90 hover:shadow-md",
    outline:
      "border border-border text-ink-muted hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 " +
      "dark:border-border-dark dark:text-ink-soft dark:hover:border-brand-500 dark:hover:bg-white/5 dark:hover:text-brand-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
