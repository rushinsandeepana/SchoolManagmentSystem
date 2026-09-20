import { useTranslation } from 'react-i18next'
import type { ChangeEvent, FormEvent } from 'react'
import Modal from '../../../components/Modal'
import { Button, InputField, MultiSelectField, SelectField } from '../../../components/ui'

type TeacherForm = {
  username: string
  password: string
  fullName: string
  email: string
  subject: string[]
  active?: boolean
}

type TeacherFormModalProps = {
  open: boolean
  editingId?: string | number | null
  form: TeacherForm
  errors: Partial<Record<keyof TeacherForm, string>>
  subjectOptions: { value: string; label: string }[]
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function TeacherFormModal({
  open,
  editingId,
  form,
  errors,
  subjectOptions,
  onChange,
  onSubmit,
  onClose,
}: TeacherFormModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={editingId ? t('teacher.edit') : t('teacher.add')} onClose={onClose}>
      <form className="ui-form" onSubmit={onSubmit} noValidate>
        <div className="ui-form__grid ui-form__grid--2">
          {/* {!editingId && ( */}
            <InputField
              label={t('auth.username')}
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder={t('auth.placeholders.username')}
              title={t('validation.usernameRequired')}
              error={errors.username}
              required
            />
          {/*  )} */}

          <InputField
            label={t('auth.password')}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required={!editingId}
            placeholder={t('auth.placeholders.password')}
            title={t('validation.passwordRequired')}
            error={errors.password}
          />

          <MultiSelectField
            label={t('teacher.subject')}
            value={form.subject}
            error={errors.subject}
            required
            options={subjectOptions}
            onChange={(values) =>
              onChange({ target: { name: 'subject', value: values } } as unknown as ChangeEvent<HTMLInputElement>)
            }
            selectPlaceholder={t('teacher.placeholders.subject', 'Select subjects')}
            noResultsLabel={t('common.noResults', 'No subjects found')}
          />

          <InputField
            label={t('teacher.fullName')}
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder={t('teacher.placeholders.fullName')}
            title={t('validation.fullNameRequired')}
            error={errors.fullName}
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
            label={t('teacher.status')}
            name="active"
            value={String(form.active)}
            onChange={onChange}
            required
            error={errors.active}
            options={[
              { value: 'true', label: t('common.active') },
              { value: 'false', label: t('common.inactive') },
            ]}
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
