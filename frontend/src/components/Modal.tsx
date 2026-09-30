import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  closeOnOutsideClick?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  closeOnOutsideClick = false,
  size = 'md',
}: ModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
  }[size]

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={
        closeOnOutsideClick ? onClose : undefined
      }
    >
      <section
        className={`modal ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>

          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </section>
    </div>
  )
}