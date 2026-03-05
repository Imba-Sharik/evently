import { mockEvents, type EventDetail } from '@/shared/mocks/events'

export function getEventByName(name: string, slot: EventDetail['timeSlot']): EventDetail {
  return mockEvents.find(e => e.name === name) ?? {
    id: name,
    name,
    timeSlot: slot,
    timeRange: slot === 'morning' ? '08:00 – 11:00' : slot === 'afternoon' ? '12:00 – 17:00' : '18:30 – 22:00',
    totalSpots: 30,
    spotsLeft: 15,
    description: `${name} – мероприятие проходит в данной локации.`,
  }
}
