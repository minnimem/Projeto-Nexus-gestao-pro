import "./Button.css";

export function Button({
  children,
  className = "",
  disabledReason = "",
  icon: Icon,
  title,
  variant = "primary",
  type = "button",
  ...props
}) {
  const buttonTitle = props.disabled && disabledReason ? disabledReason : title;

  return (
    <button
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      title={buttonTitle}
      type={type}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" size={16} />}
      {children}
    </button>
  );
}
