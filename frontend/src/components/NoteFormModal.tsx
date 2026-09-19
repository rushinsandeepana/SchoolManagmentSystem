import { useTranslation } from 'react-i18next'
import Modal from './Modal'

export default function NoteFormModal({ open, isAdmin, teachers, teacherId, setTeacherId, title, setTitle, content, setContent, onSubmit, onClose }) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('addNote')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isAdmin && (
          <label>
            {t('teacher')}
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
          {t('noteTitle')}
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          {t('noteContent')}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </label>
        <button className="btn" type="submit">
          {t('addNote')}
        </button>
      </form>
    </Modal>
  )
}
