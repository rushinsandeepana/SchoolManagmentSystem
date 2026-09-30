import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/Modal'
import { Button, SelectField } from '../../../components/ui'
import { teacherTimetableApi } from '../../../api/timetableApi'
import type {
  CreateTeacherTimetableSlotRequest,
  TeacherTimetable,
  WeeklyDay,
} from '../../../types/period'
import type { Subject } from '../../../types/subject'
import type { SchoolClass } from '../../../types/class'
import { Plus, Trash2 } from 'lucide-react'

type Teacher = {
  id: string | number
  fullName: string
}

type PeriodRow = {
  id: number
  databaseId?: number
  classId: string
  dayOfWeek: WeeklyDay | ''
  periodNumber: string
}

type SubjectSection = {
  id: number
  subjectId: string
  periods: PeriodRow[]
}

type TimetableErrors = {
  teacherId?: string
  [key: string]: string | undefined
}

type Props = {
  open: boolean
  mode?: 'create' | 'edit'
  teachers: Teacher[]
  subjects: Subject[]
  classes: SchoolClass[]
  onClose: () => void
  onSuccess: () => void
  onError?: (message: string) => void
  timetable?: TeacherTimetable[] | null
}

const DAYS: WeeklyDay[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
]

const DAY_LABELS: Record<WeeklyDay, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
}

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

const createPeriodRow = (): PeriodRow => ({
  id: Date.now() + Math.random(),
  classId: '',
  dayOfWeek: '',
  periodNumber: '',
})

const createSubjectSection = (): SubjectSection => ({
  id: Date.now() + Math.random(),
  subjectId: '',
  periods: [],
})

export default function TimetableCreateModal({
  open,
  mode = 'create',
  teachers,
  subjects,
  classes,
  onClose,
  onSuccess,
  onError,
  timetable,
}: Props) {
  const { t } = useTranslation()

  const [teacherId, setTeacherId] = useState('')
  const [subjectSections, setSubjectSections] = useState<SubjectSection[]>([])
  const [errors, setErrors] = useState<TimetableErrors>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }
    if (
      mode === 'edit' &&
      timetable &&
      timetable.length > 0
    ) {
      const first = timetable[0]

      setTeacherId(String(first.teacherId))

      const grouped = new Map<
        number,
        SubjectSection
      >()

      timetable.forEach((item) => {
        const subjectId = item.subjectId

        if (!grouped.has(subjectId)) {
          grouped.set(subjectId, {
            id: Date.now() + Math.random(),
            subjectId: String(subjectId),
            periods: [],
          })
        }

        grouped.get(subjectId)?.periods.push({
          id: Date.now() + Math.random(),
          databaseId: item.id,
          classId: String(item.classId),
          dayOfWeek: item.day,
          periodNumber: String(item.period),
        })
      })

      setSubjectSections(
        Array.from(grouped.values()),
      )

      setErrors({})
      setServerError('')

      return
    }

    if (mode === 'create') {
      setTeacherId('')
      setSubjectSections([])
      setErrors({})
      setServerError('')
    }
  }, [open, mode, timetable])

  const resetForm = () => {
    setTeacherId('')
    setSubjectSections([])
    setErrors({})
    setServerError('')
    setSaving(false)
  }

  const handleClose = () => {
    if (saving) {
      return
    }

    resetForm()
    onClose()
  }

  const handleTeacherChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const value = event.target.value

    setTeacherId(value)

    setErrors((previous) => {
      const next = { ...previous }

      delete next.teacherId

      return next
    })

    if (mode === 'create') {
      if (value) {
        setSubjectSections([
          createSubjectSection(),
        ])
      } else {
        setSubjectSections([])
      }
    }
  }

  const updateSubject = (
    sectionId: number,
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const value = event.target.value

    setSubjectSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subjectId: value,
            }
          : section,
      ),
    )

    setErrors((previous) => {
      const next = { ...previous }

      delete next[`subject-${sectionId}`]
      delete next[`periods-${sectionId}`]

      return next
    })
  }

  const addSubject = () => {
    setSubjectSections((previous) => [
      ...previous,
      createSubjectSection(),
    ])
  }

  const removeSubject = (
    sectionId: number,
  ) => {
    setSubjectSections((previous) =>
      previous.filter(
        (section) => section.id !== sectionId,
      ),
    )

    setErrors((previous) => {
      const next = { ...previous }

      delete next[`subject-${sectionId}`]
      delete next[`periods-${sectionId}`]

      return next
    })
  }

  const addPeriod = (
    sectionId: number,
  ) => {
    setSubjectSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              periods: [
                ...section.periods,
                createPeriodRow(),
              ],
            }
          : section,
      ),
    )

    setErrors((previous) => {
      const next = { ...previous }

      delete next[`periods-${sectionId}`]

      return next
    })
  }

  const removePeriod = (
    sectionId: number,
    periodId: number,
  ) => {
    setSubjectSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              periods: section.periods.filter(
                (period) =>
                  period.id !== periodId,
              ),
            }
          : section,
      ),
    )

    setErrors((previous) => {
      const next = { ...previous }

      delete next[`class-${periodId}`]
      delete next[`day-${periodId}`]
      delete next[`period-${periodId}`]

      return next
    })
  }

  const updatePeriod = (
    sectionId: number,
    periodId: number,
    field: keyof Omit<
      PeriodRow,
      'id' | 'databaseId'
    >,
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const value = event.target.value

    setSubjectSections((previous) =>
      previous.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          periods: section.periods.map(
            (period) =>
              period.id === periodId
                ? {
                    ...period,
                    [field]: value,
                  }
                : period,
          ),
        }
      }),
    )

    setErrors((previous) => {
      const next = { ...previous }

      delete next[`${field}-${periodId}`]

      return next
    })
  }

  const validateForm = () => {
    const validationErrors: TimetableErrors =
      {}

    if (!teacherId) {
      validationErrors.teacherId = t(
        'validation.teacherRequired',
      )
    }

    if (subjectSections.length === 0) {
      setErrors(validationErrors)
      return false
    }

    subjectSections.forEach((section) => {
      
      if (!section.subjectId) {
        validationErrors[
          `subject-${section.id}`
        ] = t(
          'validation.subjectRequired',
        )
      }

      if (section.periods.length === 0) {
        validationErrors[
          `periods-${section.id}`
        ] =
          'Please add at least one period.'
      }

      section.periods.forEach((period) => {
       
        if (!period.classId) {
          validationErrors[
            `class-${period.id}`
          ] = t(
            'validation.classRequired',
          )
        }

        if (!period.dayOfWeek) {
          validationErrors[
            `day-${period.id}`
          ] = t(
            'validation.dayRequired',
          )
        }

        if (!period.periodNumber) {
          validationErrors[
            `period-${period.id}`
          ] = t(
            'validation.periodRequired',
          )
        }
      })
    })

    setErrors(validationErrors)

    return (
      Object.keys(validationErrors).length ===
        0 &&
      subjectSections.length > 0
    )
  }

  const buildRequest = (
    section: SubjectSection,
    period: PeriodRow,
  ): CreateTeacherTimetableSlotRequest => ({
    teacherId: Number(teacherId),
    subjectId: Number(section.subjectId),
    classId: Number(period.classId),
    day:
      period.dayOfWeek as WeeklyDay,
    period: Number(
      period.periodNumber,
    ),
  })

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setServerError('')

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      if (mode === 'create') {
        for (const section of subjectSections) {
          for (const period of section.periods) {
            const request = buildRequest(
              section,
              period,
            )

            await teacherTimetableApi.create(
              request,
            )
          }
        }
      }

      if (mode === 'edit') {
        for (const section of subjectSections) {
          for (const period of section.periods) {
            const request = buildRequest(
              section,
              period,
            )

            if (period.databaseId) {
              await teacherTimetableApi.update(
                period.databaseId,
                request,
              )
            } else {
              await teacherTimetableApi.create(
                request,
              )
            }
          }
        }
      }

      resetForm()
      onSuccess()
    } catch (err: any) {

      const message = err?.response?.data?.message || 'Failed to save timetable.'

      setServerError(message)
      onError?.(
        t(
          'common.saveFailed',
          'Unable to save timetable. Please try again.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  const teacherOptions = teachers.map(
    (teacher) => ({
      value: String(teacher.id),
      label: teacher.fullName,
    }),
  )

  const subjectOptions = subjects.map(
    (subject) => ({
      value: String(subject.id),
      label: subject.subjectName,
    }),
  )

  const classOptions = classes.map(
    (schoolClass) => ({
      value: String(schoolClass.id),
      label: [
        schoolClass.grade,
        schoolClass.section,
      ]
        .filter(Boolean)
        .join(''),
    }),
  )

  const dayOptions = DAYS.map((day) => ({
    value: day,
    label: DAY_LABELS[day],
  }))

  const periodOptions = PERIODS.map(
    (period) => ({
      value: String(period),
      label: `P${period}`,
    }),
  )

  const modalTitle =
    mode === 'edit'
      ? t(
          'timetable.edit',
          'Edit Teacher Timetable',
        )
      : t(
          'timetable.create',
          'Create Teacher Timetable',
        )

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={handleClose}
    >
      <form
        className="form"
        onSubmit={handleSubmit}
        noValidate
      >

        <div className="form-row cols-2">
          <SelectField
            label={t('teacher.singular')}
            placeholder={t(
              'common.selectOption',
            )}
            value={teacherId}
            onChange={handleTeacherChange}
            required
            title={t(
              'validation.teacherRequired',
            )}
            error={errors.teacherId}
            options={teacherOptions}
            disabled={mode === 'edit'}
          />
        </div>

        {subjectSections.map(
          (section, index) => (
            <div
              key={section.id}
              className="border-b pb-5 mb-5 last:border-b-0"
            >

              <div className="form-row">
                <div className="flex items-start gap-2">
                  <div className="w-full sm:w-1/2">
                    <SelectField
                      label={`Subject ${
                        index + 1
                      }`}
                      placeholder={t(
                        'common.selectOption',
                      )}
                      value={
                        section.subjectId
                      }
                      onChange={(event) =>
                        updateSubject(
                          section.id,
                          event,
                        )
                      }
                      required
                      title={t(
                        'validation.subjectRequired',
                      )}
                      error={
                        errors[
                          `subject-${section.id}`
                        ]
                      }
                      options={
                        subjectOptions
                      }
                    />
                  </div>

                  <div className="mt-[1.7rem] shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={
                        !section.subjectId
                      }
                      onClick={() =>
                        addPeriod(
                          section.id,
                        )
                      }
                      aria-label="Add period"
                      title="Add period"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-[1.7rem] shrink-0">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        removeSubject(
                          section.id,
                        )
                      }
                      aria-label={`Remove Subject ${
                        index + 1
                      }`}
                      title={`Remove Subject ${
                        index + 1
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {section.periods.length >
                0 && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                    <div className="text-sm font-medium">
                      Class
                    </div>

                    <div className="text-sm font-medium">
                      Day
                    </div>

                    <div className="text-sm font-medium">
                      Period
                    </div>

                    <div />
                  </div>

                  {section.periods.map((period) => (
                    <div
                      key={period.id}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center"
                    >
                      <SelectField
                        placeholder={t(
                          'common.selectOption',
                        )}
                        value={period.classId}
                        onChange={(event) =>
                          updatePeriod(
                            section.id,
                            period.id,
                            'classId',
                            event,
                          )
                        }
                        required
                        title={t(
                          'validation.classRequired',
                        )}
                        error={
                          errors[`class-${period.id}`]
                        }
                        options={classOptions}
                      />

                      <SelectField
                        placeholder={t(
                          'common.selectOption',
                        )}
                        value={period.dayOfWeek}
                        onChange={(event) =>
                          updatePeriod(
                            section.id,
                            period.id,
                            'dayOfWeek',
                            event,
                          )
                        }
                        required
                        title={t(
                          'validation.dayRequired',
                        )}
                        error={
                          errors[`day-${period.id}`]
                        }
                        options={dayOptions}
                      />

                      <SelectField
                        placeholder={t(
                          'common.selectOption',
                        )}
                        value={period.periodNumber}
                        onChange={(event) =>
                          updatePeriod(
                            section.id,
                            period.id,
                            'periodNumber',
                            event,
                          )
                        }
                        required
                        title={t(
                          'validation.periodRequired',
                        )}
                        error={
                          errors[`period-${period.id}`]
                        }
                        options={periodOptions}
                      />

                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            removePeriod(
                              section.id,
                              period.id,
                            )
                          }
                          aria-label="Remove period"
                          title="Remove period"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        addPeriod(
                          section.id,
                        )
                      }
                    >
                      + Add Period
                    </Button>
                  </div>
                </div>
              )}

              {errors[
                `periods-${section.id}`
              ] && (
                <div className="error-message mt-2">
                  {
                    errors[
                      `periods-${section.id}`
                    ]
                  }
                </div>
              )}
            </div>
          ),
        )}

        {teacherId && (
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="secondary"
              onClick={addSubject}
            >
              + Add Subject
            </Button>
          </div>
        )}

        {serverError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-semibold text-red-700">
              ⚠ Timetable conflict
            </p>

            <p className="mt-1 text-sm text-red-600">
              {serverError}
            </p>
          </div>
        )}

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            disabled={
              saving ||
              !teacherId ||
              subjectSections.length === 0
            }
          >
            {saving
              ? t('common.saving')
              : mode === 'edit'
                ? t(
                    'common.update',
                    'Update',
                  )
                : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}