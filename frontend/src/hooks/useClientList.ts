import { useMemo, useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../types/paging'
import { useDebouncedValue } from './useDebouncedValue'

function matchesSearch<T>(row: T, search: string, searchKeys?: (keyof T)[]): boolean {
  const query = search.trim().toLowerCase()
  if (!query) return true

  const keys =
    searchKeys?.length
      ? searchKeys
      : (Object.keys(row as object) as (keyof T)[])

  return keys.some((key) => {
    const value = (row as Record<string, unknown>)[key as string]
    if (value == null) return false
    return String(value).toLowerCase().includes(query)
  })
}

export function useClientList<T>(
  data: T[],
  options?: {
    searchKeys?: (keyof T)[]
    defaultPageSize?: number
  }
) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(options?.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  const debouncedSearch = useDebouncedValue(search, 250)
  const searchKeys = options?.searchKeys

  const filtered = useMemo(
    () => data.filter((row) => matchesSearch(row, debouncedSearch, searchKeys)),
    [data, debouncedSearch, searchKeys]
  )

  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize) || 1)
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * pageSize
  const content = filtered.slice(start, start + pageSize)

  return {
    search,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(0)
    },
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size)
      setPage(0)
    },
    content,
    totalElements,
    totalPages,
  }
}
