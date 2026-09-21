import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AssignPeriodFormModal, { type AssignmentErrors } from './AssignPeriodFormModal'
import { periodApi } from '../../../api/periodApi'
import { useToast } from '../../../context/ToastContext'
import type { PeriodFilter, PeriodForm, PeriodSlot } from '../../../types/period'
import type { Subject } from '../../../types/subject'
import { subjectApi } from '../../../api/subjectApi'
import type { Teacher } from '../../../types/teacher'
import type { SchoolClass } from '../../../types/class'
import { classApi } from '../../../api/classApi'
import { Button, DataTable } from '../../../components/ui'
import { useServerList } from '../../../hooks/useServerList'
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal'

const emptyForm: PeriodForm = {
  dayOfWeek: '',
  periodNumber: '',
  periodType: '',
  subject: '',
  className: '',
  title: '',
}

export default function AssignPeriodsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<Array<{ id: number; fullName: string }>>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teacherId, setTeacherId] = useState<string>('')
  const [form, setForm] = useState<PeriodForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [errors, setErrors] = useState<AssignmentErrors>({})
  const [periodType, setPeriodType] = useState<PeriodFilter>('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetcher = useCallback(
    (query: { page?: number; size?: number; search?: string }) =>
      periodApi.getAllAssignments({ ...query, periodType: periodType || undefined }),
    [periodType]
  )
  const list = useServerList<PeriodSlot>(fetcher)

  const selectPeriodType = (next: string) => {
    const selected: PeriodFilter =
      next === 'RELIEF' || next === 'MANDATORY' || next === 'FREE' ? next : ''
    setPeriodType(selected)
    list.setPage(0)
  }

  useEffect(() => {
    if (list.error) showToast(list.error, 'error')
  }, [list.error, showToast])

  useEffect(() => {
    periodApi.getTeachers().then((res) => {
      const list = (res.data || []).filter((teacher: Teacher) => teacher.active)
      setTeachers(list)
    })
  }, [])

  useEffect(() => {
    subjectApi.getAllSubjects().then((res) => {
      const list = (res.data || []).filter((subject: Subject) => subject.active)
      setSubjects(list)
    })
  }, [])

  useEffect(() => {
    classApi.getAllClasses().then((res) => {
      const list = (res.data || []).filter((cls: any) => cls.active)
      setClasses(list)
    })
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const startEdit = (slot: PeriodSlot) => {
    setTeacherId(String(slot.teacherId))
    setForm({
      dayOfWeek: slot.dayOfWeek,
      periodNumber: slot.periodNumber,
      periodType: slot.periodType,
      subject: slot.subject || '',
      className: slot.className || '',
      title: slot.title || '',
    })
    setErrors({})
    setShowForm(true)
  }

  const startCreate = () => {
    setTeacherId('')
    setForm(emptyForm)
    setErrors({})
    setShowForm(true)
  }

  const onDelete = async (assignmentId: number) => {
    try {
      await periodApi.delete(assignmentId)
      list.reload()
      setDeleteId(null)
      showToast(t('common.deleted'), 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const onAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors: AssignmentErrors = {}
    if (!teacherId) nextErrors.teacherId = t('validation.teacherRequired')
    if (!form.dayOfWeek) nextErrors.dayOfWeek = t('validation.dayRequired')
    if (!form.periodNumber) nextErrors.periodNumber = t('validation.periodRequired')
    if (!form.periodType) nextErrors.periodType = t('validation.periodTypeRequired')
    if (!form.subject) nextErrors.subject = t('validation.subjectRequired')
    if (!form.className) nextErrors.className = t('validation.classRequired')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await periodApi.assign({
        teacherId: Number(teacherId),
        dayOfWeek: form.dayOfWeek,
        periodNumber: Number(form.periodNumber),
        periodType: form.periodType,
        subject: form.subject || null,
        className: form.className || null,
        title: form.title || null,
      })
      showToast(t('common.updated'), 'success')
      setErrors({})
      list.reload()
      setShowForm(false)
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const columns = useMemo(
      () => [
        { key: 'teacherName', label: t('asignPeriods.columns.teacherName') },
        { key: 'dayOfWeek', label: t('asignPeriods.columns.day') },
        { key: 'periodNumber', label: t('asignPeriods.columns.period') },
        {
          key: 'periodType',
          label: t('asignPeriods.columns.periodType'),
          render: (slot: PeriodSlot) => {
            const badgeClass = {
              MANDATORY: 'badge-mandatory',
              RELIEF: 'badge-relief',
              FREE: 'badge-free',
            }[slot.periodType] || 'badge'

            return <span className={`badge ${badgeClass}`}>{slot.periodType}</span>
          },
        },
        { key: 'subject', label: t('asignPeriods.columns.subject') },
        { key: 'className', label: t('asignPeriods.columns.className') },
        {
          key: 'actions',
          label: t('common.actions'),
          render: (slot: PeriodSlot) => (
            <div className="ui-action-group">
              <Button type="button" variant="primary" size="sm" onClick={() => navigate(`/periods/${slot.id}`)}>
                {t('common.activity')}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(slot)}>
                {t('common.manage')}
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => setDeleteId(slot.id)}>
                  {t('common.delete')}
            </Button>
            </div>
          ),
        },
      ],
      [navigate, t]
    )

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('nav.assignPeriods')}</h1>
        <button className="btn w-full sm:w-auto" type="button" onClick={startCreate}>
          {t('schedule.assign')}
        </button>
      </div>

      <AssignPeriodFormModal
        open={showForm}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        teacherId={teacherId}
        setTeacherId={(value) => {
          setTeacherId(value)
          setErrors((current) => ({ ...current, teacherId: undefined }))
        }}
        form={form}
        errors={errors}
        onChange={onChange}
        onSubmit={onAssign}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={list.content}
          getRowKey={(slot) => slot.id}
          emptyMessage={
            list.error
              ? list.error
              : list.search
                ? t('common.noResults')
                : t('asignPeriods.noAssignedPeriods')
          }
          searchable
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={t('common.searchPlaceholder')}
          page={list.page}
          pageSize={list.pageSize}
          totalElements={list.totalElements}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          loading={list.loading}
          filterOptions={[
            { key: 'ALL', label: 'ALL' },
            { key: 'RELIEF', label: 'Relief' },
            { key: 'MANDATORY', label: 'Mandatory' },
            { key: 'FREE', label: 'Free' },
          ]}
          activeFilter={periodType || 'ALL'}
          onFilterChange={selectPeriodType}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && onDelete(deleteId)}
      />
    </div>
  )
}
