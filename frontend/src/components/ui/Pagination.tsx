import { useTranslation } from 'react-i18next'
import { PAGE_SIZE_OPTIONS } from '../../types/paging'
import Button from './Button'

interface PaginationProps {
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

/** Returns an array of page numbers / ellipsis markers to render */
function buildPageWindows(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | '…')[] = []

  // Always show first
  pages.push(0)

  if (current > 3) pages.push('…')

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 4) pages.push('…')

  // Always show last
  pages.push(total - 1)

  return pages
}

export default function Pagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalElements === 0) return null

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)
  const windows = buildPageWindows(page, totalPages)

  return (
    <div className="ui-pagination">
      {/* Left — record range info */}
      <div className="ui-pagination__meta">
        {t('common.showingRange', { from, to, total: totalElements })}
      </div>

      {/* Right — size selector + page nav */}
      <div className="ui-pagination__controls">
        {/* Rows per page */}
        <label className="ui-pagination__size">
          <span>{t('common.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        {/* Page navigation */}
        <div className="ui-pagination__nav">
          {/* First */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 0}
            onClick={() => onPageChange(0)}
            aria-label="First page"
          >
            «
          </Button>
          {/* Prev */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
            aria-label={t('common.prev')}
          >
            ‹
          </Button>

          {/* Numbered pages */}
          <div className="ui-pagination__pages">
            {windows.map((w, i) =>
              w === '…' ? (
                <span key={`ellipsis-${i}`} className="ui-pagination__ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={w}
                  type="button"
                  className={`ui-pagination__page-btn${w === page ? ' active' : ''}`}
                  onClick={() => onPageChange(w as number)}
                  aria-current={w === page ? 'page' : undefined}
                  aria-label={`Page ${(w as number) + 1}`}
                >
                  {(w as number) + 1}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            aria-label={t('common.next')}
          >
            ›
          </Button>
          {/* Last */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            aria-label="Last page"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  )
}
