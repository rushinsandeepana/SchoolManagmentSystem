import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { teacherApi } from '../../../api/teacherApi'
import { Button, DataTable } from '../../../components/ui'
import TeacherFormModal from './TeacherFormModal'
import type { Teacher, TeacherForm } from '../../../types/teacher'

const emptyForm: TeacherForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  subject: '',
  performanceScore: 70,
  active: true,
}

export default function TeachersPage() {
  const { t } = useTranslation()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => teacherApi.list().then((res) => setTeachers(res.data))

  useEffect(() => {
    load()
  }, [])

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setMessage('')
    setError('')
  }

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id)
    setForm({
      username: teacher.username,
      password: '',
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
      performanceScore: teacher.performanceScore ?? 0,
      active: teacher.active,
    })
    setShowForm(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      if (editingId) {
        await teacherApi.update(editingId, {
          fullName: form.fullName,
          email: form.email,
          subject: form.subject,
          performanceScore: Number(form.performanceScore),
          active: form.active,
          password: form.password || undefined,
        })
        setMessage(t('updated'))
      } else {
        await teacherApi.create({
          ...form,
          performanceScore: Number(form.performanceScore),
        })
        setMessage(t('created'))
      }

      setShowForm(false)
      setForm(emptyForm)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return
    await teacherApi.remove(id)
    load()
  }

  const columns = useMemo(
    () => [
      { key: 'fullName', label: t('fullName') },
      { key: 'username', label: t('username') },
      { key: 'subject', label: t('subject') },
      {
        key: 'performanceScore',
        label: t('performanceScore'),
        render: (teacher) => `${teacher.performanceScore ?? 0}%`,
      },
      {
        key: 'active',
        label: t('active'),
        render: (teacher) => (teacher.active ? t('active') : t('inactive')),
      },
      {
        key: 'actions',
        label: t('actions'),
        render: (teacher) => (
          <div className="ui-action-group">
            <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(teacher)}>
              {t('manage')}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(teacher.id)}>
              {t('delete')}
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
        <h1>{t('teachers')}</h1>
        <Button onClick={startCreate}>{t('addTeacher')}</Button>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <TeacherFormModal
        open={showForm}
        editingId={editingId}
        form={form}
        onChange={onChange}
        onToggleActive={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
        onSubmit={onSubmit}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <DataTable columns={columns} data={teachers} getRowKey={(teacher) => teacher.id} emptyMessage={t('teachers')} />
      </div>
    </div>
  )
}
