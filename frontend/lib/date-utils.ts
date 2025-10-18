/**
 * Format a date string to CST (Central Standard Time)
 * @param dateString - ISO date string from the backend
 * @returns Formatted date string in CST with timezone suffix
 */
export function formatDateCST(dateString: string): string {
  const date = new Date(dateString)

  // Format date in CST timezone
  const formattedDate = date.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `${formattedDate} CST`
}

/**
 * Format a date string to CST (date only, no time)
 * @param dateString - ISO date string from the backend
 * @returns Formatted date string in CST with timezone suffix
 */
export function formatDateOnlyCST(dateString: string): string {
  const date = new Date(dateString)

  // Format date in CST timezone (date only)
  const formattedDate = date.toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return `${formattedDate} CST`
}
