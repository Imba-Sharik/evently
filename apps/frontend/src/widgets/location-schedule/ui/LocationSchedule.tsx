import { ScheduleTable } from '@/entities/location'
import { DAYS } from '@/shared/mocks/locations'

type DayRow = { morning: string; afternoon: string; evening: string }

type Props = {
  schedule: Record<string, DayRow>
  selectedDayKey: string
}

export function LocationSchedule({ schedule, selectedDayKey }: Props) {
  return <ScheduleTable schedule={schedule} days={DAYS} selectedDayKey={selectedDayKey} />
}
