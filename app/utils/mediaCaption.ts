import type { MediaAsset, Source } from '#shared/types/content'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, ' ')
    .trim()

// Captions start with the attributed name. Keep initials and workshop qualifiers.
const captionAuthor = (value: string) =>
  value.match(/^(.+?[\p{L}]{2,}(?:\s*\([^)]*\))?)\.\s/u)?.[1] ?? ''

export function normalizeMediaCaption(
  asset: MediaAsset,
  source?: Source,
  translatedSource?: Source,
) {
  const caption = [asset.caption, asset.description].filter(Boolean).join(' ')
  const parts = (asset.credit ?? '')
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)
  const author = parts[0]
  if (author && asset.caption) {
    const repeated = ` ${normalize(asset.caption)} `.includes(
      ` ${normalize(author)} `,
    )
    // A shared source ID connects localized author names without translating data.
    const translated =
      source &&
      translatedSource &&
      source.id === translatedSource.id &&
      normalize(captionAuthor(translatedSource.title)) === normalize(author) &&
      normalize(captionAuthor(source.title)) ===
        normalize(captionAuthor(asset.caption))
    if (repeated || translated) parts.shift()
  }
  const sourceLabel = source?.publisher || source?.title || ''
  const sourceUrl = source?.url
  return {
    caption,
    attribution: parts
      .filter((part) => normalize(part) !== normalize(sourceLabel))
      .join(' · '),
    sourceLabel,
    sourceUrl,
  }
}
