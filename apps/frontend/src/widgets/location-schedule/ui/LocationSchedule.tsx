import { ScheduleTable } from '@/entities/location'
import { DAYS } from '@/shared/mocks/locations'

type Props = {
  schedule: Record<string, string[]>
  selectedDayKey: string
}

export function LocationSchedule({ schedule, selectedDayKey }: Props) {
  return <ScheduleTable schedule={schedule} days={DAYS} selectedDayKey={selectedDayKey} />
}
