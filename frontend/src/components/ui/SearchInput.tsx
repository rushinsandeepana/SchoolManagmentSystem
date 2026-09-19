import { useTranslation } from 'react-i18next'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  className = '',
}: SearchInputProps) {
  const { t } = useTranslation()

  return (
    <div className={`ui-search-wrapper ${className}`.trim()}>
      {/* Search icon */}
      <span className="ui-search-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('common.searchPlaceholder')}
        autoComplete="off"
        aria-label={t('common.search')}
        className="ui-search-input"
      />

      {/* Clear button — only visible when there's a value */}
      {value && (
        <button
          type="button"
          className="ui-search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
          tabIndex={-1}
        >
          ×
        </button>
      )}
    </div>
  )
}
