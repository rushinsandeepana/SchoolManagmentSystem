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
  updatedAt?: string
  files: MediaFile[]
}

type PeriodDetail = {
  slot: {
    id: number
    dayOfWeek: string
    periodNumber: number
    periodType: string
    subject?: string
    title?: string
    className?: string
  }
  contents: PeriodContent[]
}

export default function PeriodDetailEditPage() {
  const { id, contentId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth() as {
    user: { role: string } | null
  }
  const { showToast } = useToast()

  const [detail, setDetail] =
    useState<PeriodDetail | null>(null)

  const [content, setContent] =
    useState<PeriodContent | null>(null)

  const [form, setForm] = useState({
    activityTitle: '',
    activityDescription: '',
    notes: '',
  })

  const [uploading, setUploading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [deletingFile, setDeletingFile] =
    useState<number | null>(null)

  const [error, setError] =
    useState('')

  /*
   * Load period and find the activity
   */
  const loadData = async () => {
    if (!id || !contentId) {
      setError('Invalid activity information')
      return
    }

    try {
      const res = await api.get(
        `/periods/${id}`
      )

      const periodDetail: PeriodDetail =
        res.data

      setDetail(periodDetail)

      const selectedContent =
        periodDetail.contents?.find(
          (item) =>
            String(item.id) === String(contentId)
        )

      if (!selectedContent) {
        setError('Activity not found')
        return
      }

      setContent({
        ...selectedContent,
        files:
          selectedContent.files || [],
      })

      setForm({
        activityTitle:
          selectedContent.activityTitle || '',

        activityDescription:
          selectedContent.activityDescription ||
          '',

        notes:
          selectedContent.notes || '',
      })
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        t('common.error')

      setError(message)
      showToast(message, 'error')
    }
  }

  useEffect(() => {
    loadData()
  }, [id, contentId])

  /*
   * Update activity
   */
  const updateContent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!id || !contentId) {
      return
    }

    setError('')
    setSaving(true)

    try {
      const res = await api.put(
        `/periods/${id}/content/${contentId}`,
        form
      )

      const updatedContent: PeriodContent = {
        ...res.data,
        files:
          res.data.files ||
          content?.files ||
          [],
      }

      setContent(updatedContent)

      setForm({
        activityTitle:
          updatedContent.activityTitle || '',

        activityDescription:
          updatedContent.activityDescription ||
          '',

        notes:
          updatedContent.notes || '',
      })

      showToast(
        'Activity updated successfully',
        'success'
      )
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        t('common.error')

      setError(message)

      showToast(
        message,
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * Upload new file
   */
  const onUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0]

    if (
      !file ||
      !content ||
      !id ||
      !contentId
    ) {
      return
    }

    setUploading(true)
    setError('')

    try {
      const body = new FormData()

      body.append('file', file)

      const res = await api.post(
        `/periods/${id}/content/${contentId}/files`,
        body,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      )

      setContent((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          files: [
            ...current.files,
            res.data,
          ],
        }
      })

      showToast(
        'File uploaded successfully',
        'success'
      )
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        t('period.uploadFailed')

      setError(message)

      showToast(
        message,
        'error'
      )
    } finally {
      setUploading(false)

      e.target.value = ''
    }
  }

  /*
   * Delete file
   */
  const deleteFile = async (
    fileId: number
  ) => {
    if (!id) {
      return
    }

    setDeletingFile(fileId)

    try {
      await api.delete(
        `/files/${fileId}`
      )

      setContent((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          files: current.files.filter(
            (file) =>
              file.id !== fileId
          ),
        }
      })

      showToast(
        'File deleted successfully',
        'success'
      )
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          t('common.error'),
        'error'
      )
    } finally {
      setDeletingFile(null)
    }
  }

  /*
   * Open file
   */
  const openFile = async (
    file: MediaFile
  ) => {
    try {
      const res = await api.get(
        `/files/${file.id}/download`,
        {
          responseType: 'blob',
        }
      )

      const url =
        URL.createObjectURL(
          res.data
        )

      window.open(
        url,
        '_blank'
      )
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          t('common.error'),
        'error'
      )
    }
  }

  /*
   * Loading
   */
  if (!detail && !error) {
    return (
      <div className="muted">
        {t('common.loading')}
      </div>
    )
  }

  /*
   * Back URL
   */
  const backTo =
    id
      ? `/periods/${id}`
      : user?.role === 'ADMIN'
        ? '/admin/periods'
        : '/teacher'

  const slot =
    detail?.slot

  return (
    <div className="fade-in min-w-0 overflow-x-hidden">

      {/* Header */}
      <div className="section-head flex-wrap gap-3">

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
                {t(
                  slot.periodType.toLowerCase()
                )}
              </span>

              <span>
                {slot.subject ||
                  slot.title ||
                  ''}

                {slot.className
                  ? ` · ${slot.className}`
                  : ''}
              </span>

            </p>
          )}

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Edit form */}
      {content && (
        <div className="card">

          <h3>
            Edit Activity
          </h3>

          <form
            className="form"
            onSubmit={updateContent}
          >

            {/* Title */}
            <label>
              {t(
                'period.activityTitle'
              )}

              <input
                value={
                  form.activityTitle
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,
                      activityTitle:
                        e.target.value,
                    })
                  )
                }
                placeholder={t(
                  'period.placeholders.activityTitle'
                )}
              />
            </label>

            {/* Description */}
            <label>
              {t(
                'period.activityDescription'
              )}

              <textarea
                value={
                  form.activityDescription
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,
                      activityDescription:
                        e.target.value,
                    })
                  )
                }
                placeholder={t(
                  'period.placeholders.activityDescription'
                )}
              />
            </label>

            {/* Notes */}
            <label>
              {t(
                'period.notes'
              )}

              <textarea
                value={
                  form.notes
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,
                      notes:
                        e.target.value,
                    })
                  )
                }
                placeholder={t(
                  'period.placeholders.notes'
                )}
              />
            </label>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">

              <button
                className="btn w-full sm:w-auto"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? '...'
                  : t('common.save')}
              </button>

              <button
                className="btn btn-outline"
                type="button"
                onClick={() =>
                  navigate(backTo)
                }
                disabled={saving}
              >
                {t('common.cancel')}
              </button>

            </div>

          </form>

          {/* Files */}
          <div className="card mt-4">

            <div className="section-head mb-3">

              <h3 className="m-0">
                Activity Files
              </h3>

              <label className="btn btn-sm m-0 cursor-pointer">

                {uploading
                  ? '...'
                  : t(
                      'period.uploadFile'
                    )}

                <input
                  type="file"
                  accept=".pdf,image/*,video/*"
                  hidden
                  onChange={onUpload}
                  disabled={uploading}
                />

              </label>

            </div>

            {/* No files */}
            {content.files.length === 0 ? (

              <p className="muted">
                {t(
                  'period.noFiles'
                )}
              </p>

            ) : (

              <div className="file-list">

                {content.files.map(
                  (file) => (

                    <div
                      key={file.id}
                      className="file-item"
                    >

                      <div className="min-w-0 flex-1">

                        <strong className="break-all">
                          {
                            file.originalFileName
                          }
                        </strong>

                        <div className="text-xs text-muted">

                          {file.fileCategory}
                          {' · '}

                          {(
                            file.fileSize /
                            1024
                          ).toFixed(1)}
                          {' KB'}

                          {file.uploadedByName
                            ? ` · ${file.uploadedByName}`
                            : ''}

                        </div>

                      </div>

                      <div className="flex gap-2">

                        {/* Open */}
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() =>
                            openFile(file)
                          }
                          title="Open file"
                          aria-label="Open file"
                        >
                          <ExternalLink
                            size={16}
                          />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          disabled={
                            deletingFile ===
                            file.id
                          }
                          onClick={() =>
                            deleteFile(
                              file.id
                            )
                          }
                          title="Delete file"
                          aria-label="Delete file"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* Done */}
          <div className="mt-4">

            <button
              className="btn"
              type="button"
              onClick={() =>
                navigate(
                  `/periods/${id}`
                )
              }
              disabled={saving}
            >
              Done
            </button>

          </div>

        </div>
      )}

    </div>
  )
}