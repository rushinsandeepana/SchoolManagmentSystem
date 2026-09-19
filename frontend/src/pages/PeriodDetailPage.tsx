import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ListControls } from '../components/ui'
import { useClientList } from '../hooks/useClientList'

type MediaFile = {
  id: number
  originalFileName: string
  fileCategory: string
  fileSize: number
  uploadedByName?: string
}

export default function PeriodDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [detail, setDetail] = useState<any>(null)
  const [form, setForm] = useState({ activityTitle: '', activityDescription: '', notes: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const files: MediaFile[] = detail?.files || []
  const fileList = useClientList(files, {
    searchKeys: ['originalFileName', 'fileCategory', 'uploadedByName'],
    defaultPageSize: 5,
  })

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
    load().catch((err) => setError(err.response?.data?.message || t('common.error')))
  }, [id])

  const saveContent = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await api.put(`/periods/${id}/content`, form)
      setDetail(res.data)
      setMessage(t('common.updated'))
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'))
    }
  }

  const onUpload = async (e: any) => {
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
      setMessage(t('common.created'))
    } catch (err: any) {
      setError(err.response?.data?.message || t('period.uploadFailed'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteFile = async (fileId: number) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    await api.delete(`/files/${fileId}`)
    await load()
  }

  const openFile = async (file: MediaFile) => {
    const res = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }

  if (!detail && !error) return <div className="muted">{t('common.loading')}</div>

  const backTo = user?.role === 'ADMIN' ? '/admin/periods' : '/teacher'
  const slot = detail?.slot

  return (
    <div className="fade-in">
      <div className="section-head">
        <div className="min-w-0">
          <Link to={backTo} className="muted hover:text-primary">
            ← {t('period.back')}
          </Link>
          <h1 className="mt-1.5 break-words text-2xl sm:text-3xl">
            {slot ? `${t(`schedule.days.${slot.dayOfWeek}`)} · P${slot.periodNumber}` : t('schedule.period')}
          </h1>
          {slot && (
            <p className="m-0 flex flex-wrap items-center gap-2 muted">
              <span className={`badge badge-${slot.periodType.toLowerCase()}`}>
                {t(slot.periodType.toLowerCase())}
              </span>
              <span>
                {slot.subject || slot.title || ''} {slot.className ? `· ${slot.className}` : ''}
              </span>
            </p>
          )}
        </div>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {detail && (
        <>
          <div className="card mb-4">
            <h3>{t('period.activity')}</h3>
            <form className="form" onSubmit={saveContent}>
              <label>
                {t('period.activityTitle')}
                <input
                  value={form.activityTitle}
                  onChange={(e) => setForm((f) => ({ ...f, activityTitle: e.target.value }))}
                  placeholder={t('period.placeholders.activityTitle')}
                />
              </label>
              <label>
                {t('period.activityDescription')}
                <textarea
                  value={form.activityDescription}
                  onChange={(e) => setForm((f) => ({ ...f, activityDescription: e.target.value }))}
                  placeholder={t('period.placeholders.activityDescription')}
                />
              </label>
              <label>
                {t('period.notes')}
                <textarea placeholder={t('period.placeholders.notes')} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </label>
              <button className="btn w-full sm:w-auto" type="submit">
                {t('common.save')}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="section-head mb-3">
              <h3 className="m-0">{t('period.files')}</h3>
              <label className="btn btn-sm m-0 cursor-pointer">
                {uploading ? '...' : t('period.uploadFile')}
                <input type="file" accept=".pdf,image/*,video/*" hidden onChange={onUpload} disabled={uploading} />
              </label>
            </div>
            <p className="muted">{t('period.uploadHint')}</p>
            <ListControls
              searchValue={fileList.search}
              onSearchChange={fileList.setSearch}
              searchPlaceholder={t('common.searchPlaceholder')}
              page={fileList.page}
              pageSize={fileList.pageSize}
              totalElements={fileList.totalElements}
              totalPages={fileList.totalPages}
              onPageChange={fileList.setPage}
              onPageSizeChange={fileList.setPageSize}
            >
              <div className="file-list">
                {fileList.content.length === 0 && (
                  <p className="muted">{fileList.search ? t('common.noResults') : t('period.noFiles')}</p>
                )}
                {fileList.content.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="min-w-0 flex-1">
                      <strong className="break-all">{file.originalFileName}</strong>
                      <div className="text-xs text-muted">
                        {file.fileCategory} · {(file.fileSize / 1024).toFixed(1)} KB · {file.uploadedByName}
                      </div>
                      {file.fileCategory === 'IMAGE' && (
                        <AuthImage fileId={file.id} alt={file.originalFileName} />
                      )}
                      {file.fileCategory === 'VIDEO' && <AuthVideo fileId={file.id} />}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button className="btn btn-outline btn-sm" type="button" onClick={() => openFile(file)}>
                        Open
                      </button>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => deleteFile(file.id)}>
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ListControls>
          </div>
        </>
      )}
    </div>
  )
}

function AuthImage({ fileId, alt }: { fileId: number; alt: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let url: string | undefined
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

function AuthVideo({ fileId }: { fileId: number }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let url: string | undefined
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
