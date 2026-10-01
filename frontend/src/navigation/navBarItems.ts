import type { TFunction } from 'i18next'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  FileText,
  KeyRound,
  LayoutDashboard,
  School,
  Users,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

export type NavGroup = {
  header: string
  items: NavItem[]
}

export function getNavBarItems(
  role: string | undefined,
  t: TFunction
): NavGroup[] {
  if (role === 'ADMIN') {
    return [
      {
        header: t('nav.main'),
        items: [
          {
            to: '/admin',
            label: t('nav.dashboard'),
            icon: LayoutDashboard,
          },
        ],
      },
      {
        header: t('nav.academicManagement'),
        items: [
          {
            to: '/admin/teachers',
            label: t('nav.teachers'),
            icon: Users,
          },
          {
            to: '/admin/subjects',
            label: t('nav.subjects'),
            icon: BookOpen,
          },
          {
            to: '/admin/classes',
            label: t('nav.classes'),
            icon: School,
          },
        ],
      },
      {
        header: t('nav.attendanceManagement'),
        items: [
          {
            to: '/admin/attendance',
            label: t('nav.teacherAttendance'),
            icon: ClipboardCheck,
          },
        ],
      },
      {
        header: t('nav.scheduleManagement'),
        items: [
          {
            to: '/admin/periods',
            label: t('nav.assignPeriods'),
            icon: CalendarPlus,
          },
          {
            to: '/admin/timetables',
            label: t('nav.timetables'),
            icon: CalendarDays,
          },
        ],
      },
      {
        header: t('nav.personal'),
        items: [
          {
            to: '/notes',
            label: t('nav.notes'),
            icon: FileText,
          },
          {
            to: '/change-password',
            label: t('nav.changePassword'),
            icon: KeyRound,
          },
        ],
      },
    ]
  }

  return [
    {
      header: t('nav.main'),
      items: [
        {
          to: '/teacher',
          label: t('nav.mySchedule'),
          icon: CalendarDays,
        },
      ],
    },
    {
      header: t('nav.personal'),
      items: [
        {
          to: '/notes',
          label: t('nav.notes'),
          icon: FileText,
        },
        {
          to: '/change-password',
          label: t('nav.changePassword'),
          icon: KeyRound,
        },
      ],
    },
  ]
}
