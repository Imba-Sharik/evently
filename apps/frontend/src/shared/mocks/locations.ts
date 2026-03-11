
export type DaySchedule = {
  morning: string   // 08:00–11:00
  afternoon: string // 12:00–17:00
  evening: string   // 18:30–22:00
}

export type Location = {
  id: number
  name: string
  image: string
  gallery: string[]
  description: string
  address: string
  metro: string
  coords: { lat: number; lng: number }
  schedule: Record<string, DaySchedule> // ключ: 'ПН' | 'ВТ' | 'СР' | 'ЧТ' | 'ПТ' | 'СБ' | 'ВС'
}

const DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const

const schedule1: Record<string, DaySchedule> = {
  ПН: { morning: 'Wellness-утро',  afternoon: 'Фото-маршрут',        evening: 'Listening Session'  },
  ВТ: { morning: 'Йога + дыхание', afternoon: '',                    evening: 'Open Mic'           },
  СР: { morning: '',               afternoon: 'Audio Walk',          evening: 'Park Talks'         },
  ЧТ: { morning: 'Тай-чи',         afternoon: 'Street Style съёмки', evening: ''                   },
  ПТ: { morning: 'Stretch',        afternoon: '',                    evening: 'Кино-вечер'         },
  СБ: { morning: 'Coffee Rave',    afternoon: 'Fashion Market',      evening: 'Кино / Классика'    },
  ВС: { morning: '',               afternoon: 'Park Quest',          evening: ''                   },
}

const schedule2: Record<string, DaySchedule> = {
  ПН: { morning: '',               afternoon: 'Поп-ап библиотека',   evening: 'Social Dance'       },
  ВТ: { morning: 'Пилатес',        afternoon: 'Audio Walk',          evening: ''                   },
  СР: { morning: 'Wellness-утро',  afternoon: '',                    evening: 'Park Talks'         },
  ЧТ: { morning: 'Йога + дыхание', afternoon: 'Фото-маршрут',        evening: 'Open Mic'           },
  ПТ: { morning: '',               afternoon: 'Fashion Market',      evening: 'Listening Session'  },
  СБ: { morning: 'Family Yoga',    afternoon: '',                    evening: 'Micro-performances' },
  ВС: { morning: 'Coffee Rave',    afternoon: 'Park Quest',          evening: ''                   },
}

const schedule3: Record<string, DaySchedule> = {
  ПН: { morning: 'Тай-чи',         afternoon: '',                    evening: 'Кино-вечер'         },
  ВТ: { morning: 'Stretch',        afternoon: 'Street Style съёмки', evening: 'Park Talks'         },
  СР: { morning: '',               afternoon: 'Поп-ап библиотека',   evening: ''                   },
  ЧТ: { morning: 'Coffee Rave',    afternoon: 'Audio Walk',          evening: 'Social Dance'       },
  ПТ: { morning: 'Пилатес',        afternoon: '',                    evening: 'Open Mic'           },
  СБ: { morning: '',               afternoon: 'Фото-маршрут',        evening: 'Listening Session'  },
  ВС: { morning: 'Family Yoga',    afternoon: 'Fashion Market',      evening: ''                   },
}

const birchDescription =
  'The Birch, обладая всеми прелестями скандинавского дизайна, представляет собой настоящее искусство в области архитектуры и интерьера. Расположенным в лесном массиве, он впечатляет своей гармонией с природным окружением, благодаря правильной геометрии пространств и большим панорамным окнам, которые просвечиваются и позволяют наслаждаться захватывающими видами на природу.'

export const locations: Location[] = [
  {
    id: 1,
    name: 'Локация #1',
    image: '/location_1.png',
    gallery: ['/gallery_1.png', '/gallery_2.png', '/gallery_3.png'],
    description: birchDescription,
    address: 'Москва ул. Ленинская Слобода, 26, стр. 35',
    metro: 'Авиамоторная',
    coords: { lat: 55.7482, lng: 37.7102 },
    schedule: schedule1,
  },
  {
    id: 2,
    name: 'Локация #2',
    image: '/location_2.png',
    gallery: ['/gallery_1.png', '/gallery_2.png', '/gallery_3.png'],
    description: birchDescription,
    address: 'Москва, ул. Садовая-Черногрязская, 13/3',
    metro: 'Красные Ворота',
    coords: { lat: 55.7693, lng: 37.6593 },
    schedule: schedule2,
  },
  {
    id: 3,
    name: 'Локация #3',
    image: '/location_3.png',
    gallery: ['/gallery_1.png', '/gallery_2.png', '/gallery_3.png'],
    description: birchDescription,
    address: 'Москва, Берсеневская наб., 6, стр. 3',
    metro: 'Кропоткинская',
    coords: { lat: 55.7439, lng: 37.6112 },
    schedule: schedule3,
  },
]


export { DAYS }
