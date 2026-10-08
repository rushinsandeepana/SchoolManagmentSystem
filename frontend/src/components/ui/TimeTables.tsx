import type { ReactNode } from 'react'

export type TimeTableColumn<T> = {
  key: string
  header: ReactNode
  className?: string
  headerClassName?: string
  render?: (item: T, index: number) => ReactNode
}

type TimeTablesProps<T> = {
  columns: TimeTableColumn<T>[]
  data: T[]
  rowKey: (item: T, index: number) => string | number
  emptyMessage?: ReactNode
  className?: string
  headerClassName?: string
  rowClassName?: string | ((item: T, index: number) => string)
}

export default function TimeTables<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records found',
  className = '',
  headerClassName = '',
  rowClassName = '',
}: TimeTablesProps<T>) {
  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-border bg-surface ${className}`}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full table-fixed border-collapse text-sm">
          <thead>
            <tr
              className={`text-white ${headerClassName}`}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`h-10 border border-border px-2 py-2 text-center text-xs font-semibold text-text sm:h-11 sm:px-3 sm:py-2.5 ${column.headerClassName ?? ''}`}
                >
                  <div className="w-full text-white whitespace-normal break-words">
                    {column.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => {
                const currentRowClass =
                  typeof rowClassName === 'function'
                    ? rowClassName(item, index)
                    : rowClassName

                return (
                  <tr
                    key={rowKey(item, index)}
                    className={currentRowClass}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`h-12 border border-border px-2 py-2 text-center align-middle text-text transition-colors hover:bg-surface-2 sm:h-14 sm:px-2 sm:py-2 ${column.className ?? ''}`}
                      >
                        <div className="flex min-h-0 w-full items-center justify-center">
                          <div className="w-full whitespace-normal break-words">
                            {column.render
                              ? column.render(item, index)
                              : null}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="h-20 border border-border px-4 py-8 text-center text-sm text-text-muted"
                >
                  <div className="whitespace-normal break-words">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}