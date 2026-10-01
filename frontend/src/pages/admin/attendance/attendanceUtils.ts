import type { AttendanceStatus, ExceptionStatus } from '../../../types/attendance'

export const EXCEPTION_STATUSES: ExceptionStatus[] = ['ABSENT', 'LEAVE', 'HALF_DAY']

export function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function firstDayOfMonthIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export function downloadBlob(data: BlobPart, fileName: string): void {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function statusBadgeClass(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'badge badge-present'
    case 'ABSENT':
      return 'badge badge-absent'
    case 'LEAVE':
      return 'badge badge-leave'
    case 'HALF_DAY':
      return 'badge badge-half-day'
    default:
      return 'badge'
  }
}

export function getStatusLabel(
  status: AttendanceStatus,
  t: (key: string) => string
): string {
  switch (status) {
    case 'PRESENT':
      return t('attendance.status.present')
    case 'ABSENT':
      return t('attendance.status.absent')
    case 'LEAVE':
      return t('attendance.status.leave')
    case 'HALF_DAY':
      return t('attendance.status.halfDay')
    default:
      return status
  }
}
