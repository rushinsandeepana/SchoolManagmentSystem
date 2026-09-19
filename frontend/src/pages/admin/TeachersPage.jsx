import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const emptyForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  subject: '',
  performanceScore: 70,
}

export default function TeachersPage() {
  const { t } = useTranslation()
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => api.get('/admin/teachers').then((res) => setTeachers(res.data))

  useEffect(() => {
    load()
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setMessage('')
    setError('')
  }

  const startEdit = (teacher) => {
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
        await api.put(`/admin/teachers/${editingId}`, {
          fullName: form.fullName,
          email: form.email,
          subject: form.subject,
          performanceScore: Number(form.performanceScore),
          active: form.active,
          password: form.password || undefined,
        })
        setMessage(t('updated'))
      } else {
        await api.post('/admin/teachers', {
          ...form,
          performanceScore: Number(form.performanceScore),
        })
        setMessage(t('created'))
      }
      setShowForm(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return
    await api.delete(`/admin/teachers/${id}`)
    load()
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1>{t('teachers')}</h1>
        <button className="btn" type="button" onClick={startCreate}>
          {t('addTeacher')}
        </button>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{editingId ? t('editTeacher') : t('addTeacher')}</h3>
          <form className="form" onSubmit={onSubmit}>
            <div className="form-row cols-2">
              {!editingId && (
                <label>
                  {t('username')}
                  <input name="username" value={form.username} onChange={onChange} required />
                </label>
              )}
              <label>
                {t('password')}
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  required={!editingId}
                  placeholder={editingId ? '(optional)' : ''}
                />
              </label>
              <label>
                {t('fullName')}
                <input name="fullName" value={form.fullName} onChange={onChange} required />
              </label>
              <label>
                {t('email')}
                <input name="email" type="email" value={form.email} onChange={onChange} />
              </label>
              <label>
                {t('subject')}
                <input name="subject" value={form.subject} onChange={onChange} />
              </label>
              <label>
                {t('performanceScore')}
                <input
                  name="performanceScore"
                  type="number"
                  min="0"
                  max="100"
                  value={form.performanceScore}
                  onChange={onChange}
                />
              </label>
            </div>
            {editingId && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={!!form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                {t('active')}
              </label>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" type="submit">
                {t('save')}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('fullName')}</th>
              <th>{t('username')}</th>
              <th>{t('subject')}</th>
              <th>{t('performanceScore')}</th>
              <th>{t('active')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.fullName}</td>
                <td>{teacher.username}</td>
                <td>{teacher.subject || '—'}</td>
                <td>{teacher.performanceScore ?? 0}%</td>
                <td>{teacher.active ? t('active') : t('inactive')}</td>
                <td>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => startEdit(teacher)}>
                    {t('manage')}
                  </button>{' '}
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(teacher.id)}>
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
