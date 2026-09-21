import { useEffect, useRef, useState } from 'react'
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

type SelectOption = {
  value: string
  label: string
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

type MultiSelectFieldProps = {
  label?: string
  error?: string
  value?: string[]
  options?: SelectOption[]
  onChange?: (value: string[]) => void
  selectPlaceholder?: string
  noResultsLabel?: string
  searchPlaceholder?: string
  className?: string
  required?: boolean
}

export function InputField({ label, className = '', error, ...props }: InputFieldProps) {
  const fieldClass = className ? `ui-input ${className}` : 'ui-input'
  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <input className={fieldClass} {...props} />
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  )
}

export function SelectField({ label, options, placeholder, className = '', error, ...props }: SelectFieldProps) {
  const selectClass = className ? `ui-select ${className}` : 'ui-select'
  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <select className={selectClass} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  )
}

export function CheckboxField({ label, className = '', ...props }: CheckboxFieldProps) {
  return (
    <label className={`ui-checkbox ${className}`.trim()}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
}

export function MultiSelectField({
  label,
  error,
  value = [],
  options = [],
  onChange,
  selectPlaceholder = 'Select options',
  noResultsLabel = 'No options found',
  className = '',
  required = false,
}: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedValues = Array.isArray(value) ? value : []
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value))

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Strictly isolate wheel scrolling to dropdown list only — prevents entire modal or parent component from scrolling
  useEffect(() => {
    if (!isOpen) return
    const menuEl = menuRef.current
    const listEl = listRef.current
    if (!menuEl || !listEl) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      listEl.scrollTop += e.deltaY
    }

    menuEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      menuEl.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen])

  const toggleOption = (optionValue: string) => {
    if (!onChange) return

    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue]

    onChange(next)
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.([])
  }

  return (
    <div className={`ui-field ${className}`.trim()} ref={containerRef}>
      {label && (
        <span className="ui-field__label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </span>
      )}

      <div className="ui-multiselect-dropdown">
        <button
          type="button"
          className="ui-select ui-multiselect-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate flex-1 text-left">
            {selectedOptions.length === 0 ? (
              <span className="text-muted">{selectPlaceholder}</span>
            ) : (
              selectedOptions.map((o) => o.label).join(', ')
            )}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedValues.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {selectedValues.length}
              </span>
            )}
            <svg
              className={`h-4 w-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className="ui-multiselect-dropdown__menu"
            role="listbox"
            aria-multiselectable="true"
          >
            <div ref={listRef} className="ui-multiselect-dropdown__list">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)

                return (
                  <label
                    key={String(option.value)}
                    className={`ui-multiselect-dropdown__item ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOption(option.value)}
                    />
                    <span className="truncate flex-1">{option.label}</span>
                  </label>
                )
              })}

              {options.length === 0 && (
                <div className="py-3 px-2 text-center text-xs text-muted">
                  {noResultsLabel}
                </div>
              )}
            </div>

            {selectedValues.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-xs text-muted">
                <span>{selectedValues.length} selected</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-danger hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
        {error && <span className="ui-field__error">{error}</span>}
      </div>
    </div>
  )
}
