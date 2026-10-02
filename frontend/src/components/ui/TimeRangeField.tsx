import { useEffect, useRef, useState } from 'react'

type TimeRangeFieldProps = {
  startTime: string
  endTime: string
  startLabel: string
  endLabel: string
  placeholder: string
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  className?: string
}

type TimeSelectProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

const FIRST_TIME_MINUTES = 7 * 60 + 30
const LAST_TIME_MINUTES = 13 * 60 + 30
const TIME_OPTIONS = Array.from(
  { length: (LAST_TIME_MINUTES - FIRST_TIME_MINUTES) / 15 + 1 },
  (_, index) => {
    const minutes = FIRST_TIME_MINUTES + index * 15
    const hours24 = Math.floor(minutes / 60)
    const minutesInHour = minutes % 60
    const period = hours24 < 12 ? 'AM' : 'PM'
    const hours12 = hours24 % 12 || 12
    const value = `${String(hours24).padStart(2, '0')}:${String(minutesInHour).padStart(2, '0')}`

    return {
      value,
      label: `${hours12}:${String(minutesInHour).padStart(2, '0')} ${period}`,
    }
  }
)

function TimeSelect({
  label,
  placeholder,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
}: TimeSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedOption = TIME_OPTIONS.find((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!wrapperRef.current?.contains(target) && !menuRef.current?.contains(target)) onClose()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onClose])

  return (
    <div ref={wrapperRef} className="ui-field relative min-w-0">
      <span className="ui-field__label">{label}</span>
      <button
        type="button"
        className="ui-select ui-select-trigger w-full min-w-0"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className={!selectedOption ? 'ui-select-placeholder' : ''}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="ui-select-chevron" aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-28 overflow-y-auto rounded-[10px] border border-border bg-surface p-1 shadow-xl"
          role="listbox"
          aria-label={label}
        >
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`min-h-7 w-full rounded-[6px] px-2 py-1 text-left text-xs ${
                option.value === value ? 'selected' : ''
              } ${
                option.value === value
                  ? 'bg-primary-soft font-medium text-primary'
                  : 'text-text hover:bg-primary-soft hover:text-primary'
              }`}
              onClick={() => {
                onChange(option.value)
                onClose()
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TimeRangeField({
  startTime,
  endTime,
  startLabel,
  endLabel,
  placeholder,
  onStartTimeChange,
  onEndTimeChange,
  className = '',
}: TimeRangeFieldProps) {
  const [openField, setOpenField] = useState<'start' | 'end' | null>(null)

  return (
    <div className={`grid w-full min-w-0 grid-cols-2 gap-2 ${className}`.trim()}>
      <TimeSelect
        label={startLabel}
        placeholder={placeholder}
        value={startTime}
        onChange={onStartTimeChange}
        isOpen={openField === 'start'}
        onToggle={() => setOpenField((current) => current === 'start' ? null : 'start')}
        onClose={() => setOpenField(null)}
      />
      <TimeSelect
        label={endLabel}
        placeholder={placeholder}
        value={endTime}
        onChange={onEndTimeChange}
        isOpen={openField === 'end'}
        onToggle={() => setOpenField((current) => current === 'end' ? null : 'end')}
        onClose={() => setOpenField(null)}
      />
    </div>
  )
}
