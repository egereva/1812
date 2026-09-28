import type { Locale } from '#shared/types/content'

// Format supplied calendar fields literally; never derive one calendar from another.
export function formatTimelineDates(
  start: string,
  end: string | undefined,
  locale: Locale,
) {
  const language = locale === 'en' ? 'en-GB' : 'ru-RU'
  const format = (value: string, options: Intl.DateTimeFormatOptions) => {
    const [year, month, day] = value.split('-').map(Number)
    return new Intl.DateTimeFormat(language, {
      ...options,
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year!, month! - 1, day!)))
  }
  const full = { day: 'numeric', month: 'long', year: 'numeric' } as const
  const startLabel = format(start, full)
  const endLabel = end ? format(end, full) : undefined
  const startOptions =
    !end || start.slice(0, 4) !== end.slice(0, 4)
      ? full
      : start.slice(0, 7) === end.slice(0, 7)
        ? ({ day: 'numeric' } as const)
        : ({ day: 'numeric', month: 'long' } as const)
  return {
    startText: format(start, startOptions),
    startLabel,
    endText: endLabel,
    endLabel,
  }
}
