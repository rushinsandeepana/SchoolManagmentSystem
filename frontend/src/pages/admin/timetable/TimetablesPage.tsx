import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { teacherTimetableApi } from '../../../api/timetableApi'
import { subjectApi } from '../../../api/subjectApi'
import { classApi } from '../../../api/classApi'
import { periodApi } from '../../../api/periodApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import { useToast } from '../../../context/ToastContext'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'
import TimetableCreateModal from './TimetableCreateModel'
import type { TeacherTimetable } from '../../../types/period'
import type { Subject } from '../../../types/subject'
import type { SchoolClass } from '../../../types/class'
import type { Teacher } from '../../../types/teacher'

export default function TimetablesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [teachers, setTeachers] = useState<
    Array<{ id: number; fullName: string }>
  >([])

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])

  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetcher = useCallback(
    (query: {
      page?: number
      size?: number
      search?: string
    }) => teacherTimetableApi.list(query),
    [],
  )

  const list = useServerList<TeacherTimetable>(fetcher)

  useEffect(() => {
    if (list.error) {
      showToast(list.error, 'error')
    }
  }, [list.error, showToast])

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await periodApi.getTeachers()

        const activeTeachers = (response.data || [])
          .filter((teacher: Teacher) => teacher.active)
          .map((teacher: Teacher) => ({
            id: Number(teacher.id),
            fullName:
              teacher.fullName ||
              [teacher.firstName, teacher.lastName]
                .filter(Boolean)
                .join(' '),
          }))

        setTeachers(activeTeachers)
      } catch (error) {
        console.error(error)
        showToast(t('common.error'), 'error')
      }
    }

    loadTeachers()
  }, [showToast, t])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await subjectApi.getAllSubjects()

        const activeSubjects = (response.data || []).filter(
          (subject: Subject) => subject.active,
        )

        setSubjects(activeSubjects)
      } catch (error) {
        console.error(error)
        showToast(t('common.error'), 'error')
      }
    }

    loadSubjects()
  }, [showToast, t])

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classApi.getAllClasses()

        const activeClasses = (response.data || []).filter(
          (schoolClass: SchoolClass) => schoolClass.active,
        )

        setClasses(activeClasses)
      } catch (error) {
        console.error(error)
        showToast(t('common.error'), 'error')
      }
    }

    loadClasses()
  }, [showToast, t])

  const startCreate = () => {
    setShowForm(true)
  }

  const startEdit = (timetable: TeacherTimetable) => {
    navigate(`/admin/teacher-timetable/${timetable.id}/edit`)
  }

  const startView = (timetable: TeacherTimetable) => {
    navigate(`/admin/teacher-timetable/${timetable.id}`)
  }

  const onDelete = async (id: number) => {
    try {
      await teacherTimetableApi.remove(id)

      showToast(
        t('common.deleted', 'Deleted successfully'),
        'success',
      )

      list.reload()
      setDeleteId(null)
    } catch (error: any) {
      showToast(
        error?.response?.data?.message ||
          t('common.error'),
        'error',
      )
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'teacherName',
        label: t('timetable.teacher'),
      },
      {
        key: 'periodNumber',
        label: t('timetable.period'),
        render: (timetable: TeacherTimetable) =>
          `P${timetable.periodNumber}`,
      },
      {
        key: 'subjectName',
        label: t('timetable.subject'),
      },
      {
        key: 'createdAt',
        label: t('timetable.createdAt'),
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (timetable: TeacherTimetable) => (
          <div className="ui-action-group">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => startEdit(timetable)}
            >
              {t('common.edit')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => startView(timetable)}
            >
              {t('common.view')}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteId(timetable.id)}
            >
              {t('common.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  )

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">
          {t('nav.timetables')}
        </h1>

        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={startCreate}
        >
          {t('timetable.add')}
        </Button>
      </div>

      <TimetableCreateModal
        open={showForm}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          list.reload()
        }}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={list.content}
          getRowKey={(timetable) => timetable.id}
          emptyMessage={
            list.search
              ? t('common.noResults')
              : t('common.emptyTableMessage')
          }
          searchable
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={t(
            'common.searchPlaceholder',
          )}
          page={list.page}
          pageSize={list.pageSize}
          totalElements={list.totalElements}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          loading={list.loading}
        />
      </div>

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) {
            onDelete(deleteId)
          }
        }}
      />
    </div>
  )
}