import { useTranslation } from 'react-i18next'
import type { ChangeEvent, FormEvent } from 'react'
import Modal from '../../../components/Modal'
import { Button, InputField, OptionGroup, SelectField } from '../../../components/ui'
import type { ClassForm } from '../../../types/class'
import { AssignmentErrors } from '../periods/AssignPeriodFormModal'

type Teacher = {
  id: string | number
  fullName: string
}

type ClassFormModalProps = {
  open: boolean
  teachers: Teacher[]
  teacherId: string | number
  setTeacherId: (value: string) => void
  editingId?: string | number | null
  form: ClassForm
  errors: AssignmentErrors
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

const grades = Array.from({ length: 13 }, (_, index) => String(index + 1))
const sections = ['A', 'B', 'C', 'D', 'E', 'F']
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export default function ClassFormModal({
  open,
  editingId,
  teachers,
  form,
  errors,
  onChange,
  onSubmit,
  onClose,
  teacherId,
  setTeacherId,
}: ClassFormModalProps) {
  const { t } = useTranslation()

  const selectToggle = (name: 'grade' | 'section', value: string) => {
    onChange({ target: { name, value } } as ChangeEvent<HTMLInputElement>)
  }

  return (
    <Modal open={open} title={editingId ? t('class.edit') : t('class.add')} onClose={onClose}>
      <form className="ui-form" onSubmit={onSubmit}>
        <OptionGroup
          name="grade"
          label={t('class.fields.grade')}
          options={grades.map((grade) => ({ value: grade, label: t('class.gradeOption', { grade }) }))}
          value={form.grade}
          onChange={(value) => selectToggle('grade', value)}
          required
        />

        <OptionGroup
          name="section"
          label={t('class.fields.section')}
          options={sections.map((section) => ({ value: section, label: section }))}
          value={form.section}
          onChange={(value) => selectToggle('section', value)}
          required
        />

        <div className="ui-form__grid ui-form__grid--2">
          <InputField
            label={t('class.fields.capacity')}
            name="capacity"
            type="number"
            min="0"
            value={form.capacity}
            onChange={onChange}
            placeholder={t('class.placeholders.capacity')}
          />

          <SelectField
            label={t('teacher.singular')}
            placeholder={t('common.selectOption')}
            value={teacherId}
            onChange={(event: { target: { value: string } }) => setTeacherId(event.target.value)}
            required
            title={t('validation.teacherRequired')}
            error={errors.teacherId}
            options={teachers.map((teacher) => ({
              value: String(teacher.id),
              label: teacher.fullName,
            }))}
          />

          <label className="ui-field sm:col-span-2">
            <span className="ui-field__label">{t('class.fields.description')}</span>
            <textarea
              className="ui-input min-h-24"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder={t('class.placeholders.description')}
            />
          </label>

          <SelectField
            label={t('class.fields.status')}
            name="active"
            value={String(form.active)}
            onChange={onChange}
            options={statusOptions}
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
