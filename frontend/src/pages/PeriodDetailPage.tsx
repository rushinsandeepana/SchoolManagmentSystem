import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function PeriodDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({ activityTitle: '', activityDescription: '', notes: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = () =>
    api.get(`/periods/${id}`).then((res) => {
      setDetail(res.data)
      setForm({
        activityTitle: res.data.activityTitle || '',
        activityDescription: res.data.activityDescription || '',
        notes: res.data.notes || '',
      })
    })

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Error'))
  }, [id])

  const saveContent = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await api.put(`/periods/${id}/content`, form)
      setDetail(res.data)
      setMessage(t('updated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      await api.post(`/periods/${id}/files`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await load()
      setMessage(t('created'))
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteFile = async (fileId) => {
    if (!window.confirm(t('confirmDelete'))) return
    await api.delete(`/files/${fileId}`)
    await load()
  }

  const openFile = async (file) => {
    const res = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  if (!detail && !error) return <div className="muted">Loading...</div>

  const backTo = user?.role === 'ADMIN' ? '/admin/periods' : '/teacher'
  const slot = detail?.slot

  return (
    <div className="fade-in">
      <div className="section-head">
        <div>
          <Link to={backTo} className="muted">
            ← {t('back')}
          </Link>
          <h1 style={{ marginTop: '0.35rem' }}>
            {slot ? `${t(slot.dayOfWeek)} · P${slot.periodNumber}` : t('period')}
          </h1>
          {slot && (
            <p className="muted" style={{ margin: 0 }}>
              <span className={`badge badge-${slot.periodType.toLowerCase()}`}>{t(slot.periodType.toLowerCase())}</span>{' '}
              {slot.subject || slot.title || ''} {slot.className ? `· ${slot.className}` : ''}
            </p>
          )}
        </div>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {detail && (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>{t('activity')}</h3>
            <form className="form" onSubmit={saveContent}>
              <label>
                {t('activityTitle')}
                <input
                  value={form.activityTitle}
                  onChange={(e) => setForm((f) => ({ ...f, activityTitle: e.target.value }))}
                />
              </label>
              <label>
                {t('activityDescription')}
                <textarea
                  value={form.activityDescription}
                  onChange={(e) => setForm((f) => ({ ...f, activityDescription: e.target.value }))}
                />
              </label>
              <label>
                {t('periodNotes')}
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </label>
              <button className="btn" type="submit">
                {t('save')}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="section-head" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>{t('files')}</h3>
              <label className="btn btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                {uploading ? '...' : t('uploadFile')}
                <input type="file" accept=".pdf,image/*,video/*" hidden onChange={onUpload} disabled={uploading} />
              </label>
            </div>
            <p className="muted">{t('uploadHint')}</p>
            <div className="file-list">
              {(detail.files || []).length === 0 && <p className="muted">{t('noFiles')}</p>}
              {(detail.files || []).map((file) => (
                <div key={file.id} className="file-item">
                  <div>
                    <strong>{file.originalFileName}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {file.fileCategory} · {(file.fileSize / 1024).toFixed(1)} KB · {file.uploadedByName}
                    </div>
                    {file.fileCategory === 'IMAGE' && (
                      <AuthImage fileId={file.id} alt={file.originalFileName} />
                    )}
                    {file.fileCategory === 'VIDEO' && <AuthVideo fileId={file.id} />}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-outline btn-sm" type="button" onClick={() => openFile(file)}>
                      Open
                    </button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => deleteFile(file.id)}>
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AuthImage({ fileId, alt }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let url
    api.get(`/files/${fileId}/download`, { responseType: 'blob' }).then((res) => {
      url = URL.createObjectURL(res.data)
      setSrc(url)
    })
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [fileId])
  if (!src) return null
  return (
    <div className="media-preview">
      <img src={src} alt={alt} />
    </div>
  )
}

function AuthVideo({ fileId }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let url
    api.get(`/files/${fileId}/download`, { responseType: 'blob' }).then((res) => {
      url = URL.createObjectURL(res.data)
      setSrc(url)
    })
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [fileId])
  if (!src) return null
  return (
    <div className="media-preview">
      <video src={src} controls />
    </div>
  )
}
