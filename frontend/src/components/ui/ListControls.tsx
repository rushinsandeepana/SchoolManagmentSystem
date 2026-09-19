import SearchInput from './SearchInput'
import Pagination from './Pagination'
import type { ReactNode } from 'react'

interface ListControlsProps {
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  page?: number
  pageSize?: number
  totalElements?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  children?: ReactNode
}

export default function ListControls({
  searchable = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  page = 0,
  pageSize = 10,
  totalElements = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  children,
}: ListControlsProps) {
  return (
    <div className="ui-list-controls">
      {searchable && onSearchChange && (
        <div className="ui-table-toolbar">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
      {children}
      {onPageChange && onPageSizeChange && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
