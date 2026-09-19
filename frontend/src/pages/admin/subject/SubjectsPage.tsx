import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { subjectApi } from '../../../api/subjectApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import { useToast } from '../../../context/ToastContext'
import SubjectFormModal from './SubjectFormModal'
import type { Subject, SubjectForm } from '../../../types/subject'

const emptyForm: SubjectForm = {
  subjectName: '',
  subjectCode: '',
  subjectType: '',
  active: true,
}

export default function SubjectsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [form, setForm] = useState<SubjectForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

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
    setForm((previous) => ({
      ...previous,
      [name]: name === 'active' ? value === 'true' : value,
    }))
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
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
    setShowForm(true)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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
      list.reload()
    } catch (error: any) {
      showToast(error.response?.data?.message || t('common.error'), 'error')
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm(t('common.confirmDelete'))) return

    try {
      await subjectApi.remove(id)
      showToast(t('common.deleted', 'Deleted successfully'), 'success')
      list.reload()
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
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(subject.id)}>
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
    </div>
  )
}
