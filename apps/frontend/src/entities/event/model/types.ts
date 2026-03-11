export type FormState = {
  name: string
  description: string
  spots: string
  startTime: string
  endTime: string
}

export const emptyForm = (): FormState => ({
  name: '',
  description: '',
  spots: '',
  startTime: '',
  endTime: '',
})
