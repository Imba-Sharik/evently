export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export type DaySchedule = {
  morning: string   // 08:00–11:00
  afternoon: string // 12:00–17:00
  evening: string   // 18:30–22:00
}

export type Location = {
  id: number
  name: string
  image: string
  schedule: Record<string, DaySchedule> // ключ: 'ПН' | 'ВТ' | 'СР' | 'ЧТ' | 'ПТ' | 'СБ' | 'ВС'
}

const DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const

const sharedSchedule: Record<string, DaySchedule> = {
  ПН: { morning: 'Wellness-утро',  afternoon: 'Фото-маршрут',         evening: 'Listening Session'  },
  ВТ: { morning: 'Йога + дыхание', afternoon: 'Поп-ап библиотека',    evening: 'Open Mic'           },
  СР: { morning: 'Пилатес',        afternoon: 'Audio Walk',            evening: 'Park Talks'         },
  ЧТ: { morning: 'Тай-чи',         afternoon: 'Street Style съёмки',   evening: 'Social Dance'       },
  ПТ: { morning: 'Stretch',        afternoon: 'Audio Walk',            evening: 'Кино-вечер'         },
  СБ: { morning: 'Coffee Rave',    afternoon: 'Fashion Market',        evening: 'Кино / Классика'    },
  ВС: { morning: 'Family Yoga',    afternoon: 'Park Quest',            evening: 'Micro-performances' },
}

export const locations: Location[] = [
  {
    id: 1,
    name: 'Локация #1',
    image: '/location_1.png',
    schedule: sharedSchedule,
  },
  {
    id: 2,
    name: 'Локация #2',
    image: '/location_2.png',
    schedule: sharedSchedule,
  },
  {
    id: 3,
    name: 'Локация #3',
    image: '/location_3.png',
    schedule: sharedSchedule,
  },
]

export const TIME_LABELS = {
  morning:   'Утро (08:00–11:00)',
  afternoon: 'День (12:00–17:00)',
  evening:   'Вечер (18:30–22:00)',
} satisfies Record<TimeSlot, string>

export { DAYS }
