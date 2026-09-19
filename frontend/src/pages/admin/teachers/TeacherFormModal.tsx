import { useTranslation } from 'react-i18next'
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

export default function TeacherFormModal({ open, editingId, form, onChange, onToggleActive, onSubmit, onClose }) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={editingId ? t('editTeacher') : t('addTeacher')} onClose={onClose}>
      <form className="ui-form" onSubmit={onSubmit}>
        <div className="ui-form__grid ui-form__grid--2">
          {!editingId && (
            <InputField
              label={t('username')}
              name="username"
              value={form.username}
              onChange={onChange}
              required
            />
          )}

          <InputField
            label={t('password')}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required={!editingId}
            placeholder={editingId ? '(optional)' : ''}
          />

          <InputField
            label={t('fullName')}
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            required
          />

          <InputField
            label={t('email')}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
          />

          <SelectField
            label={t('subject')}
            name="subject"
            value={form.subject}
            onChange={onChange}
            options={subjectOptions}
          />

          <InputField
            label={t('performanceScore')}
            type="number"
            name="performanceScore"
            min="0"
            max="100"
            value={form.performanceScore}
            onChange={onChange}
          />
        </div>

        {editingId && (
          <CheckboxField
            label={t('active')}
            checked={!!form.active}
            onChange={onToggleActive}
          />
        )}

        <div className="ui-form__actions">
          <Button type="submit">{t('save')}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
