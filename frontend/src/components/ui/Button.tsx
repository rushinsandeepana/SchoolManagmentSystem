export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`]

  if (className) {
    classes.push(className)
  }

  return (
    <button type={type} className={classes.join(' ')} {...props}>
      {children}
    </button>
  )
}
