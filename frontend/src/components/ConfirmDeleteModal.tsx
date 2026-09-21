import Modal from './Modal'
import { useTranslation } from 'react-i18next'

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('common.confirmDelete')} onClose={onClose}>
      <p>{t('common.confirmDelete')}</p>
      <div className="form-actions justify-end">
        <button className="btn btn-outline" type="button" onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </button>
        <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={loading}>
          {loading ? '...' : t('common.delete')}
        </button>
      </div>
    </Modal>
  )
}
