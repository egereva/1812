// Website navigation is external when its normalized origin differs from ours.
// Relative paths, fragments and same-origin absolute URLs stay in this tab.
export function externalLinkAttributes(href: string, siteUrl: string) {
  try {
    const base = new URL(siteUrl)
    const destination = new URL(href, base)
    if (
      (destination.protocol === 'https:' || destination.protocol === 'http:') &&
      destination.origin !== base.origin
    )
      return { target: '_blank', rel: 'noopener noreferrer' } as const
  } catch {
    // Preserve existing hrefs; URL validation/editorial correction is separate.
  }
  return {}
}
