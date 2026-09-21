import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { classApi } from '../../../api/classApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import { useToast } from '../../../context/ToastContext'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'
import ClassFormModal from './ClassFormModal'
import type { ClassForm, SchoolClass } from '../../../types/class'
import { periodApi } from '../../../api/periodApi'
import { Teacher } from '../../../types/teacher'

const emptyForm: ClassForm = {
  grade: '',
  section: '',
  description: '',
  capacity: '',
  active: true,
}

export default function ClassesPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [form, setForm] = useState<ClassForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [teachers, setTeachers] = useState<Array<{ id: number; fullName: string }>>([])
  const [teacherId, setTeacherId] = useState<string>('')

  const fetcher = useCallback(
    (query: { page?: number; size?: number; search?: string }) => classApi.list(query),
    []
  )
  const list = useServerList<SchoolClass>(fetcher)

  useEffect(() => {
    if (list.error) showToast(list.error, 'error')
  }, [list.error, showToast])

  useEffect(() => {
    periodApi.getTeachers().then((res) => {
      const list = (res.data || []).filter((teacher: Teacher) => teacher.active)
      setTeachers(list)
    })
  }, [])

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'capacity' ? (value === '' ? '' : Number(value)) : name === 'active' ? value === 'true' : value,
    }))
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setTeacherId('')
    setShowForm(true)
  }

  const startEdit = (schoolClass: SchoolClass) => {
    setEditingId(schoolClass.id)
    setForm({
      grade: schoolClass.grade,
      section: schoolClass.section,
      description: schoolClass.description || '',
      capacity: schoolClass.capacity ?? '',
      active: schoolClass.active,
    })
    setTeacherId(schoolClass.classTeacherId ? String(schoolClass.classTeacherId) : '')
    setShowForm(true)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.grade || !form.section) {
      showToast(t('class.validation.gradeSectionRequired'), 'error')
      return
    }

    const payload = {
      grade: form.grade,
      section: form.section,
      description: form.description,
      capacity: form.capacity === '' ? null : Number(form.capacity),
      classTeacherId: teacherId ? Number(teacherId) : null,
      active: form.active,
    }

    try {
      if (editingId) {
        await classApi.update(editingId, payload)
        showToast(t('common.updated'), 'success')
      } else {
        await classApi.create(payload)
        showToast(t('common.created'), 'success')
      }
      setShowForm(false)
      setForm(emptyForm)
      list.reload()
    } catch (error: any) {
      const message = error.response?.data?.message
      showToast(
        message === 'A class with this grade and section already exists'
          ? t('class.validation.duplicate')
          : message || t('common.error'),
        'error'
      )
    }
  }

  const onDelete = async (id: number) => {
    try {
      await classApi.remove(id)
      showToast(t('common.deleted', 'Deleted successfully'), 'success')
      list.reload()
      setDeleteId(null)
    } catch (error: any) {
      showToast(error.response?.data?.message || t('common.error'), 'error')
    }
  }

  const columns = useMemo(
    () => [
      { key: 'grade', label: t('class.fields.grade'), render: (schoolClass: SchoolClass) => `${schoolClass.grade} ${schoolClass.section}` },
      { key: 'classTeacherName', label: t('class.fields.classTeacherName') },
      { key: 'capacity', label: t('class.fields.capacity') },
      { key: 'description', label: t('class.fields.description') },
      {
        key: 'active',
        label: t('class.fields.status'),
        render: (schoolClass: SchoolClass) => (schoolClass.active ? t('common.active') : t('common.inactive')),
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (schoolClass: SchoolClass) => (
          <div className="ui-action-group">
            <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(schoolClass)}>
              {t('common.manage')}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setDeleteId(schoolClass.id)}>
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
        <h1 className="text-2xl sm:text-3xl">{t('nav.classes')}</h1>
        <Button className="w-full sm:w-auto" onClick={startCreate}>
          {t('class.add')}
        </Button>
      </div>

      <ClassFormModal
        open={showForm}
        teachers={teachers}
        teacherId={teacherId}
        setTeacherId={setTeacherId}
        editingId={editingId}
        form={form}
        errors={{}}
        onChange={onChange}
        onSubmit={onSubmit}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={list.content}
          getRowKey={(schoolClass) => schoolClass.id}
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
