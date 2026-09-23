import type { ButtonHTMLAttributes, SelectHTMLAttributes } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectControlProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[]
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

export function SelectControl({ options, className = '', ...props }: SelectControlProps) {
  return (
    <select className={`ui-select ${className}`.trim()} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function IconButton({ label, className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      className={`icon-btn ${className}`.trim()}
      type="button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}