import { ScheduleTable } from '@/entities/location'
import type { Location } from '@/shared/mocks/locations'
import { DAYS } from '@/shared/mocks/locations'

type Props = {
  schedule: Location['schedule']
  selectedDayKey: string
}

export function LocationSchedule({ schedule, selectedDayKey }: Props) {
  return <ScheduleTable schedule={schedule} days={DAYS} selectedDayKey={selectedDayKey} />
}
