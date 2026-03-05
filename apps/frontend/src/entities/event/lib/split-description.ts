/** Split "EventName – rest of description" into bold + normal parts */
export function splitDescription(description: string): [string, string] {
  const idx = description.indexOf(' – ')
  if (idx === -1) return ['', description]
  return [description.slice(0, idx), description.slice(idx)]
}
