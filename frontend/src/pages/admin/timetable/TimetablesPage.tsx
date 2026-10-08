import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { teacherTimetableApi } from '../../../api/timetableApi'
// import { subjectApi } from '../../../api/subjectApi'
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
import type { PageResponse } from '../../../types/paging'
import TimetableViewModal from './TimetableViewModal'

type TeacherTimetableGroup = {
  teacherId: number
  teacherName: string
  periodCount: number
  subjects: string[]
  createdAt: string
  records: TeacherTimetable[]
}

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
  const [editingTimetable, setEditingTimetable] = useState<TeacherTimetable[] | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingTimetable, setViewingTimetable] = useState<TeacherTimetable[] | null>(null)

  const fetcher = useCallback(
  async (query: {
    page?: number
    size?: number
    search?: string
  }): Promise<{ data: PageResponse<TeacherTimetable> }> => {
    const response = await teacherTimetableApi.list(query)

    const data = Array.isArray(response.data)
      ? response.data
      : []

    return {
      data: {
        content: data,
        page: 0,
        totalElements: data.length,
        totalPages: 1,
        size: data.length || 1,
      },
    }
  },
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

        const teachers = (response.data || []).map(
          (teacher: Teacher) => ({
            id: Number(teacher.id),
            fullName: teacher.fullName,
          }),
        )

        setTeachers(teachers)
      } catch (error) {
        console.error(error)
        showToast(t('common.error'), 'error')
      }
    }

    loadTeachers()
  }, [showToast, t])

  // useEffect(() => {
  //   const loadSubjects = async () => {
  //     try {
  //       const response = await subjectApi.getAllSubjects()

  //       const activeSubjects = (response.data || []).filter(
  //         (subject: Subject) => subject.active,
  //       )

  //       setSubjects(activeSubjects)
  //     } catch (error) {
  //       console.error(error)
  //       showToast(t('common.error'), 'error')
  //     }
  //   }

  //   loadSubjects()
  // }, [showToast, t])

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
    setEditingTimetable(null)
    setShowForm(true)
  }

  const startEdit = ( timetable: TeacherTimetableGroup) => {
    setEditingTimetable(timetable.records)
    setShowForm(true)
  }

  const startView = ( timetable: TeacherTimetableGroup) => {
    setViewingTimetable(timetable.records)
    setShowViewModal(true)
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

  const groupedTimetables = useMemo(() => {
    const grouped = new Map<
      number,
      TeacherTimetableGroup
    >()

    list.content.forEach((timetable) => {
      const timetableWithCreatedAt =
        timetable as TeacherTimetable & {
          createdAt?: string
        }

      const existing = grouped.get(timetable.teacherId)

      if (existing) {
        existing.periodCount += 1

        if (
          timetable.subjectName &&
          !existing.subjects.includes(
            timetable.subjectName,
          )
        ) {
          existing.subjects.push(
            timetable.subjectName,
          )
        }

        existing.records.push(timetable)

        if (
          timetableWithCreatedAt.createdAt &&
          (!existing.createdAt ||
            new Date(
              timetableWithCreatedAt.createdAt,
            ).getTime() >
              new Date(existing.createdAt).getTime())
        ) {
          existing.createdAt =
            timetableWithCreatedAt.createdAt
        }
      } else {
        grouped.set(timetable.teacherId, {
          teacherId: timetable.teacherId,
          teacherName: timetable.teacherName,
          periodCount: 1,
          subjects: timetable.subjectName
            ? [timetable.subjectName]
            : [],
          createdAt:
            timetableWithCreatedAt.createdAt || '',
          records: [timetable],
        })
      }
    })

    return Array.from(grouped.values())
  }, [list.content])

  const columns = useMemo(
    () => [
      {
        key: 'teacherName',
        label: t('timetable.teacher'),
      },
      {
        key: 'periodCount',
        label: t('timetable.period'),
        render: (
          timetable: TeacherTimetableGroup,
        ) => (
          <div className="text-center">
            {timetable.periodCount}
          </div>
        ),
      },
      {
        key: 'subjects',
        label: t('timetable.subject'),
        render: (
          timetable: TeacherTimetableGroup,
        ) => {
          const subjectLines = []

          for ( let i = 0; i < timetable.subjects.length; i += 2) {
            subjectLines.push(
              timetable.subjects
                .slice(i, i + 2)
                .join(', '),
            )
          }

          return (
            <div className="whitespace-nowrap">
              {subjectLines.map((line, index) => (
                <div key={index}>
                  {line}
                </div>
              ))}
            </div>
          )
        },
      },
      {
        key: 'createdAt',
        label: t('timetable.createdAt'),
        render: (
          timetable: TeacherTimetableGroup,
        ) => timetable.createdAt
          ? timetable.createdAt.split('T')[0]
          : '',
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (
          timetable: TeacherTimetableGroup,
        ) => {
          const firstRecord =
            timetable.records[0]

          return (
            <div className="ui-action-group">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  startEdit(timetable)
                }
              >
                {t('common.edit')}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => startView(timetable)}
              >
                {t('common.view')}
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() =>
                  setDeleteId(firstRecord.teacherId)
                }
              >
                {t('common.delete')}
              </Button>
            </div>
          )
        },
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
        // subjects={subjects}
        classes={classes}
        mode={editingTimetable ? 'edit' : 'create'}
        timetable={editingTimetable}
        onClose={() => {
          setShowForm(false)
          setEditingTimetable(null)
        }}
        onSuccess={() => {
          setShowForm(false)
          setEditingTimetable(null)
          list.reload()
        }}
      />

      <TimetableViewModal
        open={showViewModal}
        timetable={viewingTimetable}
        onClose={() => {
          setShowViewModal(false)
          setViewingTimetable(null)
        }}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={groupedTimetables}
          getRowKey={(timetable) =>
            timetable.teacherId
          }
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
          totalElements={groupedTimetables.length}
          totalPages={1}
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
