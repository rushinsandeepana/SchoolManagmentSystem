import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { teacherApi } from '../api/teacherApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NoteFormModal from '../components/NoteFormModal'
import { ListControls } from '../components/ui'
import { useServerList } from '../hooks/useServerList'
import type { ListQuery, PageResponse } from '../types/paging'

type Note = {
  id: number
  title: string
  content: string
  createdByName?: string
  createdAt: string
}

type TeacherOption = {
  id: number
  fullName: string
}

export default function NotesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [teacherId, setTeacherId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const fetcher = useCallback(
    (query: ListQuery) => {
      if (isAdmin) {
        if (!teacherId) {
          return Promise.resolve({
            data: {
              content: [],
              page: 0,
              size: query.size ?? 10,
              totalElements: 0,
              totalPages: 1,
            } satisfies PageResponse<Note>,
          })
        }
        return api.get<PageResponse<Note>>(`/admin/teachers/${teacherId}/notes`, { params: query })
      }
      return api.get<PageResponse<Note>>('/teacher/notes', { params: query })
    },
    [isAdmin, teacherId]
  )

  const list = useServerList<Note>(fetcher, [isAdmin, teacherId])

  useEffect(() => {
    if (isAdmin) {
      teacherApi.listAll().then((res) => {
        const options = res.data.content || []
        setTeachers(options)
        if (options[0]) setTeacherId(String(options[0].id))
      })
    }
  }, [isAdmin])

  // Surface server-list errors as toasts
  useEffect(() => {
    if (list.error) showToast(list.error, 'error')
  }, [list.error, showToast])


  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    try {
      if (isAdmin) {
        await api.post('/admin/notes', { teacherId: Number(teacherId), title, content })
      } else {
        await api.post('/teacher/notes', { teacherId: user?.userId, title, content })
      }
      setTitle('')
      setContent('')
      setShowForm(false)
      showToast(t('common.created'), 'success')
      list.reload()
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    try {
      await api.delete(isAdmin ? `/admin/notes/${id}` : `/teacher/notes/${id}`)
      showToast(t('common.deleted', 'Deleted successfully'), 'success')
      list.reload()
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('notes.title')}</h1>
        <button className="btn w-full sm:w-auto" type="button" onClick={() => setShowForm(true)}>
          {t('notes.add')}
        </button>
      </div>



      <NoteFormModal
        open={showForm}
        isAdmin={isAdmin}
        teachers={teachers}
        teacherId={teacherId}
        setTeacherId={setTeacherId}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        onSubmit={onSubmit}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <ListControls
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={t('common.searchPlaceholder')}
          page={list.page}
          pageSize={list.pageSize}
          totalElements={list.totalElements}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        >
          <div className="grid gap-3">
            {list.loading && <p className="muted">{t('common.loading')}</p>}
            {!list.loading && list.content.length === 0 && (
              <p className="muted">{list.search ? t('common.noResults') : t('notes.noNotes')}</p>
            )}
            {list.content.map((note) => (
              <div key={note.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <strong className="break-words">{note.title}</strong>
                  <button
                    className="btn btn-danger btn-sm shrink-0"
                    type="button"
                    onClick={() => onDelete(note.id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
                <p className="my-1.5 break-words">{note.content}</p>
                <div className="text-xs text-muted">
                  {note.createdByName} · {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ListControls>
      </div>
    </div>
  )
}
