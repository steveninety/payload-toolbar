/**
 * Formats a time difference to a very compact string representation
 * Uses the largest possible unit rounded down, except for seconds
 *
 * @param date - The date to compare against now
 * @returns Compact time string (e.g., "5s", "2min", "3h", "1d", "2w", "1mo", "1y")
 */
export function formatTimeAgoCompact(date: string | number | Date): string {
  const now = new Date().getTime()
  const then = new Date(date).getTime()
  const diffMs = now - then

  // If the date is in the future, return "0s"
  if (diffMs < 0) {
    return '0s'
  }

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30) // Approximate month as 30 days
  const diffYears = Math.floor(diffDays / 365) // Approximate year as 365 days

  // Return the largest unit that makes sense
  if (diffYears >= 1) {
    return `${diffYears}y`
  }

  if (diffMonths >= 1) {
    return `${diffMonths}mo`
  }

  if (diffWeeks >= 1) {
    return `${diffWeeks}w`
  }

  if (diffDays >= 1) {
    return `${diffDays}d`
  }

  if (diffHours >= 1) {
    return `${diffHours}h`
  }

  if (diffMinutes >= 1) {
    return `${diffMinutes}min`
  }

  // For seconds, we show the actual seconds (not rounded down to larger unit)
  return `${diffSeconds}s`
}
