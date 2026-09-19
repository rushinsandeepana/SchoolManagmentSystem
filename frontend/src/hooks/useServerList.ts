import { useCallback, useEffect, useState } from 'react'
import type { ListQuery, PageResponse } from '../types/paging'
import { DEFAULT_PAGE_SIZE } from '../types/paging'
import { useDebouncedValue } from './useDebouncedValue'

type Fetcher<T> = (query: ListQuery) => Promise<{ data: PageResponse<T> }>

export function useServerList<T>(fetcher: Fetcher<T>, deps: unknown[] = []) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [content, setContent] = useState<T[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetcher({
        page,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
      })
      setContent(res.data.content || [])
      setTotalElements(res.data.totalElements ?? 0)
      setTotalPages(Math.max(1, res.data.totalPages ?? 1))
    } catch (err: any) {
      setContent([])
      setTotalElements(0)
      setTotalPages(1)
      setError(err?.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }, [fetcher, page, pageSize, debouncedSearch])

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps])

  return {
    search,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(0)
    },
    page,
    setPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size)
      setPage(0)
    },
    content,
    totalElements,
    totalPages,
    loading,
    error,
    reload,
  }
}
