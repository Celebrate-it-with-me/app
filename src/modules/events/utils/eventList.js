import { parseEventDate, daysUntil } from '@/views/internal/dashboard/dashboardLogic'

/**
 * Order for the "My events" list: upcoming events first (soonest on top), then the ones that already
 * happened (most recent first), and events without a date last.
 */
export function sortEvents(events, now = new Date()) {
  const upcoming = []
  const past = []
  const undated = []
  for (const event of events) {
    const date = parseEventDate(event.startDate)
    if (!date) undated.push(event)
    else if (daysUntil(date, now) >= 0) upcoming.push({ event, date })
    else past.push({ event, date })
  }
  upcoming.sort((a, b) => a.date - b.date)
  past.sort((a, b) => b.date - a.date)
  return [...upcoming.map(x => x.event), ...past.map(x => x.event), ...undated]
}
