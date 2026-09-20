export function InputField({ label, className = '', ...props }) {
  const fieldClass = className ? `ui-input ${className}` : 'ui-input'
  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <input className={fieldClass} {...props} />
    </label>
  )
}

export function SelectField({ label, options, className = '', ...props }) {
  const selectClass = className ? `ui-select ${className}` : 'ui-select'
  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <select className={selectClass} {...props}>
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CheckboxField({ label, className = '', ...props }) {
  return (
    <label className={`ui-checkbox ${className}`.trim()}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
}

export function MultiSelectField({ label, value = [], options = [], onChange, className = '' }) {
  const selectedValues = Array.isArray(value) ? value : []

  const toggleOption = (optionValue) => {
    if (!onChange) return

    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue]

    onChange(next)
  }

  return (
    <div className={`ui-field ${className}`.trim()}>
      {label && <span className="ui-field__label">{label}</span>}
      <div className="ui-multiselect">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)

          return (
            <button
              key={String(option.value)}
              type="button"
              className={`ui-multiselect__option ${isSelected ? 'selected' : ''}`.trim()}
              onClick={() => toggleOption(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
