import catalog from '../data/imageDelivery.json' with { type: 'json' }

type Delivery = {
  width: number
  height: number
  bytes: number
  sha256: string
  variants: { src: string; width: number; height: number; bytes: number }[]
}

export const imageDeliveryCatalog: Record<string, Delivery> = catalog

export function imageDeliveryAttributes(
  src: string,
  baseURL: string,
  sizes = 'auto, (max-width: 900px) calc(100vw - 2rem), 1024px',
) {
  const prefix = baseURL.replace(/\/$/, '')
  const image = imageDeliveryCatalog[src]
  return {
    src: `${prefix}${src}`,
    width: image?.width,
    height: image?.height,
    ...(image?.variants.length
      ? {
          srcset: image.variants
            .map((variant) => `${prefix}${variant.src} ${variant.width}w`)
            .join(', '),
          sizes,
        }
      : {}),
  }
}
