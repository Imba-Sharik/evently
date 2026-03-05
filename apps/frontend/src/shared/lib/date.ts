export const WEEKDAY_MAP: Record<number, string> = {
  0: 'ВС', 1: 'ПН', 2: 'ВТ', 3: 'СР', 4: 'ЧТ', 5: 'ПТ', 6: 'СБ',
}

export const MONTHS_RU = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря',
]

export const WEEKDAYS_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

export function formatDate(date: Date) {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_RU[date.getMonth()]}`
}

export function formatDateLong(date: Date) {
  return `${date.getDate()} ${MONTHS_RU[date.getMonth()]}, ${date.getFullYear()}`
}

export function getDayKey(date: Date) {
  return WEEKDAY_MAP[date.getDay()]
}
