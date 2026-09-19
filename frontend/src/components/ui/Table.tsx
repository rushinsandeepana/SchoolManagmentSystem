import React from 'react'
import Pagination from './Pagination'
import SearchInput from './SearchInput'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns?: Column<T>[]
  data?: T[]
  getRowKey?: (row: T, index: number) => string | number
  emptyMessage?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  page?: number
  pageSize?: number
  totalElements?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  loading?: boolean
}

export default function DataTable<T>({
  columns = [],
  data = [],
  getRowKey,
  emptyMessage = 'No records found',
  searchable = false,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  page = 0,
  pageSize = 10,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: DataTableProps<T>) {
  const rowKey = getRowKey || ((_row: T, index: number) => index)
  const showPagination =
    typeof totalElements === 'number' &&
    typeof onPageChange === 'function' &&
    typeof onPageSizeChange === 'function'

  return (
    <div className="ui-table-panel">
      {searchable && onSearchChange && (
        <div className="ui-table-toolbar">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="ui-table__empty" colSpan={columns.length}>
                  …
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <tr key={rowKey(row, index)}>
                  {columns.map((column) => (
                    <td key={`${rowKey(row, index)}-${String(column.key)}`}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key as string] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="ui-table__empty" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalElements={totalElements!}
          totalPages={totalPages ?? Math.max(1, Math.ceil(totalElements! / pageSize))}
          onPageChange={onPageChange!}
          onPageSizeChange={onPageSizeChange!}
        />
      )}
    </div>
  )
}
