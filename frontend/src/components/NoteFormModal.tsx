import { useTranslation } from 'react-i18next'
import type { FormEvent } from 'react'
import Modal from './Modal'
import { Button, InputField, SelectField, TextareaField } from './ui'

type NoteFormModalProps = {
  open: boolean
  isAdmin: boolean
  teachers: { id: string | number; fullName: string }[]
  teacherId: string | number
  setTeacherId: (value: string) => void
  title: string
  setTitle: (value: string) => void
  content: string
  setContent: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function NoteFormModal({ open, isAdmin, teachers, teacherId, setTeacherId, title, setTitle, content, setContent, onSubmit, onClose }: NoteFormModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('notes.add')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isAdmin && (
          <SelectField
            label={t('teacher.singular')}
            value={String(teacherId)}
            onChange={(event) => setTeacherId(event.target.value)}
            required
            options={teachers.map((teacher) => ({
              value: String(teacher.id),
              label: teacher.fullName,
            }))}
          />
        )}
        <InputField
          label={t('notes.noteTitle')}
          placeholder={t('notes.placeholders.title')}
          title={t('validation.noteTitleRequired')}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <TextareaField
          label={t('notes.noteContent')}
          placeholder={t('notes.placeholders.content')}
          title={t('validation.noteContentRequired')}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />
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
