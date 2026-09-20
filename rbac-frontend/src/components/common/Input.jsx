/* =====================================================
   INPUT — reusable labeled input field
   Usage: <Input label="Email" name="email" value={x} onChange={fn} />
   API unchanged — only visual treatment upgraded.
===================================================== */
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  ...rest
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-ink-muted dark:text-ink-soft">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
        className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink
                    transition-all duration-150 ease-out-soft placeholder:text-ink-soft/70
                    focus:outline-none focus:ring-4
                    dark:bg-surface-dark-raised dark:text-ink-inverse ${
                      error
                        ? "border-danger focus:ring-danger/15"
                        : "border-border focus:border-brand-500 focus:ring-brand-500/15 dark:border-border-dark"
                    }`}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default Input;
