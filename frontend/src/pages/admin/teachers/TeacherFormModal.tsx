import { useTranslation } from 'react-i18next'
import type { ChangeEvent, FormEvent } from 'react'
import Modal from '../../../components/Modal'
import { Button, CheckboxField, InputField, SelectField } from '../../../components/ui'

const subjectOptions = [
  { value: '', label: '—' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'ICT', label: 'ICT' },
]

type TeacherForm = {
  username: string
  password: string
  fullName: string
  email: string
  subject: string
  performanceScore: string | number
  active?: boolean
}

type TeacherFormModalProps = {
  open: boolean
  editingId?: string | number | null
  form: TeacherForm
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onToggleActive: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function TeacherFormModal({
  open,
  editingId,
  form,
  onChange,
  onToggleActive,
  onSubmit,
  onClose,
}: TeacherFormModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={editingId ? t('teacher.edit') : t('teacher.add')} onClose={onClose}>
      <form className="ui-form" onSubmit={onSubmit}>
        <div className="ui-form__grid ui-form__grid--2">
          {!editingId && (
            <InputField
              label={t('auth.username')}
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder={t('auth.placeholders.username')}
              required
            />
          )}

          <InputField
            label={t('auth.password')}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required={!editingId}
            placeholder={t('auth.placeholders.password')}
          />

          <InputField
            label={t('teacher.fullName')}
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder={t('teacher.placeholders.fullName')}
            required
          />

          <InputField
            label={t('teacher.email')}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder={t('teacher.placeholders.email')}
          />

          <SelectField
            label={t('teacher.subject')}
            name="subject"
            value={form.subject}
            onChange={onChange}
            options={subjectOptions}
          />

          <InputField
            label={t('teacher.performanceScore')}
            type="number"
            name="performanceScore"
            min="0"
            max="100"
            value={form.performanceScore}
            onChange={onChange}
            placeholder={t('teacher.placeholders.performanceScore')}
          />
        </div>

        {editingId && (
          <CheckboxField
            label={t('common.active')}
            checked={!!form.active}
            onChange={onToggleActive}
          />
        )}

        <div className="ui-form__actions">
          <Button type="submit" className="w-full sm:w-auto">
            {t('common.save')}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
