import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { subjectApi } from '../../../api/subjectApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import { useToast } from '../../../context/ToastContext'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'
import SubjectFormModal from './SubjectFormModal'
import type { Subject, SubjectForm } from '../../../types/subject'

const emptyForm: SubjectForm = {
  subjectName: '',
  subjectCode: '',
  subjectType: '',
  active: true,
}

const randomCodeDigits = () => Math.floor(1000 + Math.random() * 9000).toString()

const subjectCodePrefix = (subjectName: string) => {
  const letters = subjectName.replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (!letters) return ''
  return `${letters.slice(0, 2)}${letters.slice(-1)}`
}

export default function SubjectsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [form, setForm] = useState<SubjectForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof SubjectForm, string>>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetcher = useCallback(
    (query: { page?: number; size?: number; search?: string }) => subjectApi.list(query),
    []
  )
  const list = useServerList<Subject>(fetcher)

  useEffect(() => {
    if (list.error) showToast(list.error, 'error')
  }, [list.error, showToast])

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setErrors((previous) => {
      if (!(name in previous)) return previous
      const next = { ...previous }
      delete next[name as keyof SubjectForm]
      return next
    })
    setForm((previous) => {
      if (name === 'subjectName') {
        const prefix = subjectCodePrefix(value)
        const existingDigits = previous.subjectCode.match(/\d{4}$/)?.[0] || randomCodeDigits()
        return {
          ...previous,
          subjectName: value,
          subjectCode: prefix ? `${prefix}${existingDigits}` : '',
        }
      }

      return {
        ...previous,
        [name]: name === 'active' ? value === 'true' : value,
      }
    })
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setShowForm(true)
  }

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id)
    setForm({
      subjectName: subject.subjectName || '',
      subjectCode: subject.subjectCode || '',
      subjectType: subject.subjectType || '',
      active: subject.active,
    })
    setErrors({})
    setShowForm(true)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Partial<Record<keyof SubjectForm, string>> = {}
    if (!form.subjectName.trim()) nextErrors.subjectName = t('validation.subjectNameRequired')
    if (!form.subjectCode.trim()) nextErrors.subjectCode = t('validation.subjectCodeRequired')
    if (!form.subjectType) nextErrors.subjectType = t('validation.subjectTypeRequired')

    const duplicate = list.content.some(
      (subject) =>
        subject.id !== editingId &&
        subject.subjectName.trim().toLowerCase() === form.subjectName.trim().toLowerCase()
    )
    if (duplicate) nextErrors.subjectName = t('validation.subjectNameDuplicate')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      if (editingId) {
        await subjectApi.update(editingId, {
          subjectName: form.subjectName,
          subjectCode: form.subjectCode,
          subjectType: form.subjectType,
          active: form.active,
        })
        showToast(t('common.updated'), 'success')
      } else {
        await subjectApi.create({
          ...form,
        })
        showToast(t('common.created'), 'success')
      }

      setShowForm(false)
      setForm(emptyForm)
      setErrors({})
      list.reload()
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      if (message.toLowerCase().includes('subject name')) {
        setErrors({ subjectName: message })
      }
      showToast(message, 'error')
    }
  }

  const onDelete = async (id: number) => {
    try {
      await subjectApi.remove(id)
      showToast(t('common.deleted', 'Deleted successfully'), 'success')
      list.reload()
      setDeleteId(null)
    } catch (error: any) {
      showToast(error.response?.data?.message || t('common.error'), 'error')
    }
  }

  const columns = useMemo(
    () => [
      { key: 'subjectName', label: t('subject.subjectName') },
      { key: 'subjectCode', label: t('subject.subjectCode') },
      { key: 'subjectType', label: t('subject.subjectType') },
      {
        key: 'active',
        label: t('common.active'),
        render: (subject: Subject) => (subject.active ? t('common.active') : t('common.inactive')),
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (subject: Subject) => (
          <div className="ui-action-group">
            <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(subject)}>
              {t('common.manage')}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setDeleteId(subject.id)}>
              {t('common.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t]
  )

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('nav.subjects')}</h1>
        <Button className="w-full sm:w-auto" onClick={startCreate}>
          {t('subject.add')}
        </Button>
      </div>

      <SubjectFormModal
        open={showForm}
        editingId={editingId}
        form={form}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={list.content}
          getRowKey={(subject) => subject.id}
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
