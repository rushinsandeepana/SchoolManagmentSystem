import { useTranslation } from 'react-i18next'
import Modal from './Modal'

export default function NoteFormModal({ open, isAdmin, teachers, teacherId, setTeacherId, title, setTitle, content, setContent, onSubmit, onClose }) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('notes.add')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isAdmin && (
          <label>
            {t('teacher.singular')}
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          {t('notes.noteTitle')}
          <input placeholder={t('notes.placeholders.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          {t('notes.noteContent')}
          <textarea placeholder={t('notes.placeholders.content')} value={content} onChange={(e) => setContent(e.target.value)} required />
        </label>
        <div className="form-actions">
          <button className="btn w-full sm:w-auto" type="submit">
            {t('notes.add')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
