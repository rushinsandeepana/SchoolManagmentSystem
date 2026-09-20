import type { ReactNode } from 'react'

type OptionGroupProps = {
  name: string
  label: string
  options: { value: string; label: ReactNode }[]
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function OptionGroup({ name, label, options, value, onChange, required = false }: OptionGroupProps) {
  return (
    <div className="ui-field">
      <span className="ui-field__label">
        {label}
        {required && <span className="required-mark"> *</span>}
      </span>
      <div className="ui-option-group" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`ui-option-group__option ${value === option.value ? 'selected' : ''}`.trim()}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input name={name} value={value} required={required} readOnly hidden aria-hidden="true" />
    </div>
  )
}
