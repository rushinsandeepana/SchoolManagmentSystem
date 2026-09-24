import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ExternalLink, Trash2 } from 'lucide-react'

type MediaFile = {
  id: number
  originalFileName: string
  fileCategory: string
  fileSize: number
  uploadedByName?: string
}

type PeriodContent = {
  id: number
  activityTitle?: string
  activityDescription?: string
  notes?: string
  files: MediaFile[]
}

export default function PeriodDetailAddPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth() as { user: { role: string } | null }
  const { showToast } = useToast()

  const [detail, setDetail] = useState<any>(null)
  const [form, setForm] = useState({
    activityTitle: '',
    activityDescription: '',
    notes: '',
  })
  const [createdContent, setCreatedContent] = useState<PeriodContent | null>(null)

  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPeriod = async () => {
    const res = await api.get(`/periods/${id}`)
    setDetail(res.data)
  }

  useEffect(() => {
    loadPeriod().catch((err) => {
      const message =
        err.response?.data?.message || t('common.error')

      setError(message)
      showToast(message, 'error')
    })
  }, [id, showToast])

  const saveContent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setError('')
    setSaving(true)

    try {
      const res = await api.post(
        `/periods/${id}/content`,
        form
      )

      const content: PeriodContent = {
        ...res.data,
        files: res.data.files || [],
      }

      setCreatedContent(content)

      showToast(t('common.created'), 'success')
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        t('common.error')

      setError(message)
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]

  if (!file || !createdContent || !id) {
    return
  }

  setUploading(true)
  setError('')

  try {
    const body = new FormData()
    body.append('file', file)

    const res = await api.post(
      `/periods/${id}/content/${createdContent.id}/files`,
      body,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    setCreatedContent((current) => {
      if (!current) return current

      return {
        ...current,
        files: [
          ...current.files,
          res.data,
        ],
      }
    })

    showToast(t('common.created'), 'success')
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      t('period.uploadFailed')

    setError(message)
    showToast(message, 'error')
  } finally {
    setUploading(false)
    e.target.value = ''
  }
}

  if (!detail && !error) {
    return <div className="muted">{t('common.loading')}</div>
  }

  const backTo =
    user?.role === 'ADMIN'
      ? `/admin/periods/${id}`
      : `/periods/${id}`

  const slot = detail?.slot

  return (
    <div className="fade-in">
      <div className="section-head">
        <div className="min-w-0">
          <Link
            to={backTo}
            className="muted hover:text-primary"
          >
            ← {t('period.back')}
          </Link>

          <h1 className="mt-1.5 break-words text-2xl sm:text-3xl">
            {slot
              ? `${t(
                  `schedule.days.${slot.dayOfWeek}`
                )} · P${slot.periodNumber}`
              : t('schedule.period')}
          </h1>

          {slot && (
            <p className="m-0 flex flex-wrap items-center gap-2 muted">
              <span
                className={`badge badge-${slot.periodType.toLowerCase()}`}
              >
                {t(slot.periodType.toLowerCase())}
              </span>

              <span>
                {slot.subject || slot.title || ''}
                {slot.className
                  ? ` · ${slot.className}`
                  : ''}
              </span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {detail && (
        <div className="card">
          <h3>New Activity</h3>

          <form
            className="form"
            onSubmit={saveContent}
          >
            <label>
              {t('period.activityTitle')}

              <input
                value={form.activityTitle}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    activityTitle: e.target.value,
                  }))
                }
                placeholder={t(
                  'period.placeholders.activityTitle'
                )}
              />
            </label>

            <label>
              {t('period.activityDescription')}

              <textarea
                value={form.activityDescription}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    activityDescription:
                      e.target.value,
                  }))
                }
                placeholder={t(
                  'period.placeholders.activityDescription'
                )}
              />
            </label>

            <label>
              {t('period.notes')}

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    notes: e.target.value,
                  }))
                }
                placeholder={t(
                  'period.placeholders.notes'
                )}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn w-full sm:w-auto"
                type="submit"
                disabled={saving}
              >
                {saving ? '...' : t('common.save')}
              </button>

              <button
                className="btn btn-outline"
                type="button"
                onClick={() => navigate(backTo)}
                disabled={saving}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
          {createdContent && (
            <div className="card mt-4">
              <div className="section-head mb-3">
                <h3 className="m-0">
                  Activity Files
                </h3>

                <label className="btn btn-sm m-0 cursor-pointer">
                  {uploading
                    ? '...'
                    : t('period.uploadFile')}

                  <input
                    type="file"
                    accept=".pdf,image/*,video/*"
                    hidden
                    onChange={onUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {createdContent.files.length === 0 ? (
                <p className="muted">
                  {t('period.noFiles')}
                </p>
              ) : (
                <div className="file-list">
                  {createdContent.files.map((file) => (
                    <div
                      key={file.id}
                      className="file-item"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="break-all">
                          {file.originalFileName}
                        </strong>

                        <div className="text-xs text-muted">
                          {file.fileCategory} ·{' '}
                          {(file.fileSize / 1024).toFixed(1)} KB
                          {file.uploadedByName
                            ? ` · ${file.uploadedByName}`
                            : ''}
                        </div>
                      </div>

                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.get(
                              `/files/${file.id}/download`,
                              {
                                responseType: 'blob',
                              }
                            )

                            const url =
                              URL.createObjectURL(res.data)

                            window.open(url, '_blank')
                          } catch (err: any) {
                            showToast(
                              err.response?.data?.message ||
                                t('common.error'),
                              'error'
                            )
                          }
                        }}
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <button
                  className="btn"
                  type="button"
                  onClick={() => navigate(`/periods/${id}`)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}