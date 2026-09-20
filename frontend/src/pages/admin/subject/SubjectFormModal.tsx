import { useTranslation } from 'react-i18next'
import type { ChangeEvent, FormEvent } from 'react'
import Modal from '../../../components/Modal'
import { Button, InputField, SelectField } from '../../../components/ui'
import type { SubjectForm } from '../../../types/subject'

const subjectOptions = [
  { value: '', label: 'Select subject type' },
  { value: 'MANDATORY', label: 'Mandatory' },
  { value: 'OPTIONAL', label: 'Optional' },
]

type SubjectFormModalProps = {
  open: boolean
  editingId?: string | number | null
  form: SubjectForm
  errors: Partial<Record<keyof SubjectForm, string>>
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function SubjectFormModal({
  open,
  editingId,
  form,
  errors,
  onChange,
  onSubmit,
  onClose,
}: SubjectFormModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={editingId ? t('subject.edit') : t('subject.add')} onClose={onClose}>
      <form className="ui-form" onSubmit={onSubmit} noValidate>
        <div className="ui-form__grid ui-form__grid--2">
          <InputField
            label={t('subject.fields.subjectName')}
            name="subjectName"
            value={form.subjectName}
            onChange={onChange}
            placeholder={t('subject.placeholders.name')}
            title={t('validation.subjectNameRequired')}
            error={errors.subjectName}
            required
          />

          <InputField
            label={t('subject.fields.subjectCode')}
            name="subjectCode"
            value={form.subjectCode}
            onChange={onChange}
            placeholder={t('subject.placeholders.code')}
            title={t('validation.subjectCodeRequired')}
            error={errors.subjectCode}
            disabled
            readOnly
            required
          />

          <SelectField
            label={t('subject.fields.subjectType')}
            name="subjectType"
            value={form.subjectType}
            onChange={onChange}
            required
            title={t('validation.subjectTypeRequired')}
            error={errors.subjectType}
            options={subjectOptions}
          />

        </div>

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
