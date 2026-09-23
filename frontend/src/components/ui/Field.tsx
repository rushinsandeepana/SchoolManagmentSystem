import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

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

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
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
  const { name, value = '', onChange, disabled, required, title, id } = props
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => String(option.value) === String(value))

  useEffect(() => {
    if (!open) return undefined

    const updateMenuPosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      if (!trigger) return

      const menuHeight = Math.min((options.length + (placeholder ? 1 : 0)) * 36 + 8, 188)
      const spaceBelow = window.innerHeight - trigger.bottom
      const top = spaceBelow >= menuHeight || trigger.top < menuHeight
        ? trigger.bottom + 4
        : trigger.top - menuHeight - 4

      setMenuStyle({ left: trigger.left, top, width: trigger.width })
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    updateMenuPosition()
    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, options.length, placeholder])

  const selectOption = (nextValue: string) => {
    const target = { name: name || '', value: nextValue } as HTMLSelectElement
    onChange?.({ target, currentTarget: target } as React.ChangeEvent<HTMLSelectElement>)
    setOpen(false)
  }

  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <div ref={triggerRef} className="ui-select-wrapper">
        <button
          id={id}
          type="button"
          className={`ui-select ui-select-trigger ${className}`.trim()}
          title={title}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={!selectedOption ? 'ui-select-placeholder' : ''}>
            {selectedOption?.label || placeholder || ''}
          </span>
          <span className="ui-select-chevron" aria-hidden="true">⌄</span>
        </button>
        <input type="hidden" name={name} value={String(value)} required={required} />
        {open && createPortal(
          <div ref={menuRef} className="ui-select-menu" style={menuStyle} role="listbox">
            {placeholder && (
              <button type="button" className="ui-select-option ui-select-placeholder" onClick={() => selectOption('')}>
                {placeholder}
              </button>
            )}
            {options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={String(option.value) === String(value)}
                className={`ui-select-option${String(option.value) === String(value) ? ' selected' : ''}`}
                onClick={() => selectOption(String(option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
      </div>
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  )
}

export function TextareaField({ label, className = '', error, ...props }: TextareaFieldProps) {
  const textareaClass = className ? `ui-input ${className}` : 'ui-input'
  const isRequired = Boolean(props.required)

  return (
    <label className="ui-field">
      {label && <span className="ui-field__label">{label}{isRequired && <span className="required-mark"> *</span>}</span>}
      <textarea className={textareaClass} {...props} />
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
