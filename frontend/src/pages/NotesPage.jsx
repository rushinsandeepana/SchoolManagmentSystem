import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function NotesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [teachers, setTeachers] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'ADMIN'

  const loadNotes = async (tid) => {
    if (isAdmin) {
      if (!tid) return
      const res = await api.get(`/admin/teachers/${tid}/notes`)
      setNotes(res.data)
    } else {
      const res = await api.get('/teacher/notes')
      setNotes(res.data)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/teachers').then((res) => {
        setTeachers(res.data)
        if (res.data[0]) setTeacherId(String(res.data[0].id))
      })
    } else {
      loadNotes()
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && teacherId) loadNotes(teacherId)
  }, [teacherId, isAdmin])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      if (isAdmin) {
        await api.post('/admin/notes', { teacherId: Number(teacherId), title, content })
        await loadNotes(teacherId)
      } else {
        await api.post('/teacher/notes', { teacherId: user.userId, title, content })
        await loadNotes()
      }
      setTitle('')
      setContent('')
      setMessage(t('created'))
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return
    await api.delete(isAdmin ? `/admin/notes/${id}` : `/teacher/notes/${id}`)
    if (isAdmin) await loadNotes(teacherId)
    else await loadNotes()
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1>{t('notes')}</h1>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>{t('addNote')}</h3>
        <form className="form" onSubmit={onSubmit}>
          {isAdmin && (
            <label>
              {t('teacher')}
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            {t('noteTitle')}
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            {t('noteContent')}
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
          </label>
          <button className="btn" type="submit">
            {t('addNote')}
          </button>
        </form>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
        {notes.length === 0 && <p className="muted">{t('noNotes')}</p>}
        {notes.map((note) => (
          <div key={note.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong>{note.title}</strong>
              <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(note.id)}>
                {t('delete')}
              </button>
            </div>
            <p style={{ margin: '0.35rem 0' }}>{note.content}</p>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {note.createdByName} · {new Date(note.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
