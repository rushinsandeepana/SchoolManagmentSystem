import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { teacherApi } from '../../../api/teacherApi'
import { subjectApi } from '../../../api/subjectApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import { useToast } from '../../../context/ToastContext'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'
import TeacherFormModal from './TeacherFormModal'
import type { Teacher, TeacherForm } from '../../../types/teacher'
import type { Subject } from '../../../types/subject'

const emptyForm: TeacherForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  subject: [],
  active: true,
}

export default function TeachersPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherForm, string>>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetcher = useCallback(
    (query: { page?: number; size?: number; search?: string }) => teacherApi.list(query),
    []
  )

  const list = useServerList<Teacher>(fetcher)  

  useEffect(() => {
    subjectApi.list({ page: 0, size: 100 }).then((res) => {
      setSubjects((res.data.content || []).filter((subject: Subject) => subject.active))
    }).catch((err) => {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    })
  }, [showToast, t])

  // Show list-level errors as toasts
  useEffect(() => {
    if (list.error) showToast(list.error, 'error')
  }, [list.error, showToast])

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrors((previous) => {
      if (!(e.target.name in previous)) return previous
      const next = { ...previous }
      delete next[e.target.name as keyof TeacherForm]
      return next
    })
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.name === 'active' ? e.target.value === 'true' : e.target.value,
    }))
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setShowForm(true)
  }

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id)
    setForm({
      username: teacher.username,
      password: '',
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      subject: teacher.subjectIds?.map(String) || [],
      active: teacher.active,
    })
    setErrors({})
    setShowForm(true)
  }

  const subjectMap = useMemo(() => {
    return new Map(
      subjects.map((subject) => [subject.id, subject.subjectName])
    )
  }, [subjects])

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    const nextErrors: Partial<Record<keyof TeacherForm, string>> = {}
    if (!form.username.trim()) nextErrors.username = t('validation.usernameRequired')
    if (!editingId && !form.password.trim()) nextErrors.password = t('validation.passwordRequired')
    if (!form.fullName.trim()) nextErrors.fullName = t('validation.fullNameRequired')
    if (!form.subject.length) nextErrors.subject = t('validation.subjectRequired')
    if (form.active === undefined) nextErrors.active = t('validation.statusRequired')

    const duplicate = list.content.some(
      (subject) =>
        subject.id !== editingId &&
        subject.username.trim().toLowerCase() === form.username.trim().toLowerCase()
    )
    if (duplicate) nextErrors.username = t('validation.usernameDuplicate')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      if (editingId) {
        await teacherApi.update(editingId, {
          fullName: form.fullName,
          email: form.email,
          subjectIds: form.subject.map(Number),
          active: form.active,
          password: form.password || undefined,
        })
        showToast(t('common.updated'), 'success')
      } else {
        const createData = {
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          email: form.email,
          subjectIds: form.subject.map(Number),
          active: form.active,
        }
        await teacherApi.create(createData)
        showToast(t('common.created'), 'success')
      }

      setShowForm(false)
      setForm(emptyForm)
      setErrors({})
      list.reload()
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const onDelete = async (id: number) => {
    try {
      await teacherApi.remove(id)
      showToast(t('common.deleted', 'Deleted successfully'), 'success')
      list.reload()
      setDeleteId(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const columns = useMemo(
    () => [
      { key: 'fullName', label: t('teacher.fullName') },
      { key: 'username', label: t('auth.username') },
      {
        key: 'subject',
        label: t('teacher.subject'),
        render: (teacher: Teacher) => {
          const subjectNames =
            teacher.subjectIds
              ?.map((subjectId) => subjectMap.get(subjectId))
              .filter(Boolean) || []

          if (subjectNames.length === 0) {
            return '-'
          }

          const rows = []

          for (let i = 0; i < subjectNames.length; i += 2) {
            rows.push(subjectNames.slice(i, i + 2))
          }

          return (
            <div className="flex flex-col gap-1">
              {rows.map((row, index) => (
                <div key={index}>
                  {row.join(', ')}
                </div>
              ))}
            </div>
          )
        },
      },
      {
        key: 'active',
        label: t('common.active'),
        render: (teacher: Teacher) => (teacher.active ? t('common.active') : t('common.inactive')),
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (teacher: Teacher) => (
          <div className="ui-action-group">
            <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(teacher)}>
              {t('common.edit')}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setDeleteId(teacher.id)}>
              {t('common.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t, subjectMap]
  )

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('nav.teachers')}</h1>
        <Button className="w-full sm:w-auto" onClick={startCreate}>
          {t('teacher.add')}
        </Button>
      </div>

      <TeacherFormModal
        open={showForm}
        editingId={editingId}
        form={form}
        errors={errors}
        subjectOptions={subjects
          .slice()
          .sort((first, second) => first.subjectName.localeCompare(second.subjectName))
          .map((subject) => ({ value: String(subject.id), label: subject.subjectName }))}
        onChange={onChange}
        onSubmit={onSubmit}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={list.content}
          getRowKey={(teacher) => teacher.id}
          emptyMessage={list.search ? t('common.noResults') : t('common.emptyTableMessage')}
          searchable
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={t('common.searchPlaceholder')}
          page={list.page}
          pageSize={list.pageSize}
          totalElements={list.totalElements}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          loading={list.loading}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && onDelete(deleteId)}
      />
    </div>
  )
}
