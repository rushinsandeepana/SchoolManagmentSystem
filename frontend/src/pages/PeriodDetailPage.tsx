import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
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

type DeleteTarget =
  | { type: 'file'; id: number }
  | { type: 'activity'; id: number }
  | null

export default function PeriodDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth() as { user: { role: string } | null }
  const { showToast } = useToast()

  const [deleteTarget, setDeleteTarget] =
    useState<DeleteTarget>(null)

  const [detail, setDetail] = useState<any>(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.get(`/periods/${id}`)
      setDetail(res.data)
    } catch (err: any) {
      const message =
        err.response?.data?.message || t('common.error')

      setError(message)
      showToast(message, 'error')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const openFile = async (file: MediaFile) => {
    try {
      const res = await api.get(
        `/files/${file.id}/download`,
        {
          responseType: 'blob',
        }
      )

      const url = URL.createObjectURL(res.data)
      window.open(url, '_blank')
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          t('common.error'),
        'error'
      )
    }
  }

  const deleteFile = async (fileId: number) => {
    try {
      await api.delete(`/files/${fileId}`)

      showToast(
        'File deleted successfully',
        'success'
      )

      setDeleteTarget(null)
      await load()
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          t('common.error'),
        'error'
      )
    }
  }

  const deleteActivity = async (
    contentId: number
  ) => {
    if (!id) return

    try {
      await api.delete(
        `/periods/${id}/content/${contentId}`
      )

      showToast(
        'Activity deleted successfully',
        'success'
      )

      setDeleteTarget(null)
      await load()
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          t('common.error'),
        'error'
      )
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    if (deleteTarget.type === 'file') {
      await deleteFile(deleteTarget.id)
      return
    }

    await deleteActivity(deleteTarget.id)
  }

  if (!detail && !error) {
    return (
      <div className="muted">
        {t('common.loading')}
      </div>
    )
  }

  const backTo =
    user?.role === 'ADMIN'
      ? '/admin/periods'
      : '/teacher'

  const slot = detail?.slot
  const contents: PeriodContent[] =
    detail?.contents || []

  return (
    <div className="fade-in min-w-0 overflow-x-hidden">
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
            <p className="m-0 flex flex-wrap items-center gap-2 muted break-words">
              <span
                className={`badge badge-${slot.periodType.toLowerCase()}`}
              >
                {t(slot.periodType.toLowerCase())}
              </span>

              <span className="break-words">
                {slot.subject || slot.title || ''}
                {slot.className
                  ? ` · ${slot.className}`
                  : ''}
              </span>
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={() =>
            navigate(
              `/periods/${id}/activity/new`
            )
          }
        >
          + New Activity
        </Button>
      </div>

      {error && (
        <div className="alert alert-error break-words">
          {error}
        </div>
      )}

      {detail && (
        <>
          {contents.length === 0 ? (
            <div className="card min-w-0 overflow-hidden">
              <p className="muted">
                No activities available for this period.
              </p>
            </div>
          ) : (
            contents.map((content, index) => (
              <div
                className="card mb-4 min-w-0 overflow-hidden"
                key={content.id}
              >
                <div className="section-head mb-3 min-w-0 flex-wrap gap-2">
                  <h3 className="m-0 min-w-0 break-words">
                    Activity {index + 1}
                  </h3>

                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: 'activity',
                        id: content.id,
                      })
                    }
                    title="Delete activity"
                    aria-label="Delete activity"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="min-w-0 overflow-hidden">
                  <h4 className="break-words">
                    {content.activityTitle ||
                      'No activity title'}
                  </h4>

                  {content.activityDescription && (
                    <p className="whitespace-pre-wrap break-words">
                      {content.activityDescription}
                    </p>
                  )}

                  {content.notes && (
                    <div className="mt-4 min-w-0">
                      <strong>
                        {t('period.notes')}
                      </strong>

                      <p className="whitespace-pre-wrap break-words">
                        {content.notes}
                      </p>
                    </div>
                  )}

                  {!content.activityTitle &&
                    !content.activityDescription &&
                    !content.notes && (
                      <p className="muted break-words">
                        No activity details available.
                      </p>
                    )}
                </div>

                <div className="mt-5 min-w-0 overflow-hidden">
                  <h4>{t('period.files')}</h4>

                  {content.files?.length === 0 ? (
                    <p className="muted mt-3">
                      {t('period.noFiles')}
                    </p>
                  ) : (
                    <div className="file-list mt-3 min-w-0 overflow-hidden">
                      {content.files.map((file) => (
                        <div
                          key={file.id}
                          className="file-item min-w-0 flex-wrap gap-3 overflow-hidden"
                        >
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <strong className="block break-all">
                              {file.originalFileName}
                            </strong>

                            <div className="text-xs text-muted break-words">
                              {file.fileCategory} ·{' '}
                              {(
                                file.fileSize / 1024
                              ).toFixed(1)}{' '}
                              KB
                              {file.uploadedByName
                                ? ` · ${file.uploadedByName}`
                                : ''}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() =>
                                openFile(file)
                              }
                              title="Open file"
                              aria-label="Open file"
                            >
                              <ExternalLink size={16} />
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'file',
                                  id: file.id,
                                })
                              }
                              title="Delete file"
                              aria-label="Delete file"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={confirmDelete}
      />
    </div>
  )
}