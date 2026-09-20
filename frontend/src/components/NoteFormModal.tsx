import { useTranslation } from 'react-i18next'
import Modal from './Modal'

export default function NoteFormModal({ open, isAdmin, teachers, teacherId, setTeacherId, title, setTitle, content, setContent, onSubmit, onClose }) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('notes.add')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isAdmin && (
          <label>
            {t('teacher.singular')}<span className="required-mark"> *</span>
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
          {t('notes.noteTitle')}<span className="required-mark"> *</span>
          <input placeholder={t('notes.placeholders.title')} title={t('validation.noteTitleRequired')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          {t('notes.noteContent')}<span className="required-mark"> *</span>
          <textarea placeholder={t('notes.placeholders.content')} title={t('validation.noteContentRequired')} value={content} onChange={(e) => setContent(e.target.value)} required />
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
