import type PhotoSwipe from 'photoswipe'
import type { MediaAsset } from '#shared/types/content'
import { getSourceById } from '#shared/content/index'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const icon = (paths: string) =>
  `<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${paths}</svg>`

export function useMuseumImageViewer() {
  const { locale, t } = useI18n()
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref('')
  let viewer: PhotoSwipe | undefined
  let request = 0

  function dispose() {
    request++
    viewer?.destroy()
    viewer = undefined
    loading.value = false
  }

  onBeforeUnmount(dispose)
  watch(locale, dispose)

  async function open(
    images: MediaAsset[],
    index: number,
    trigger: HTMLElement,
  ) {
    if (!import.meta.client || loading.value || viewer || !images.length) return
    const currentRequest = ++request
    loading.value = true
    error.value = ''

    try {
      // The content schema stays unchanged. Obtain actual dimensions from the
      // local binaries in the browser, in parallel with the lazy core import.
      const [module, slides] = await Promise.all([
        import('photoswipe'),
        Promise.all(
          images.map(async (asset) => {
            const image = new Image()
            image.src = `${config.app.baseURL.replace(/\/$/, '')}${asset.src}`
            await image.decode()
            return {
              src: image.src,
              width: image.naturalWidth,
              height: image.naturalHeight,
              alt: asset.alt,
            }
          }),
        ),
      ])
      if (currentRequest !== request || !trigger.isConnected) return

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      let metadata: HTMLElement | undefined
      let observer: ResizeObserver | undefined
      let background: { element: HTMLElement; inert: boolean }[] = []
      const previousOverflow = document.body.style.overflow
      const pswp = new module.default({
        dataSource: slides,
        index,
        mainClass: 'museum-viewer',
        bgOpacity: 1,
        showHideAnimationType: 'fade',
        showAnimationDuration: reducedMotion ? 0 : 180,
        hideAnimationDuration: reducedMotion ? 0 : 180,
        zoomAnimationDuration: reducedMotion ? 0 : 180,
        wheelToZoom: true,
        // Native-resolution zoom is useful; avoid enlarging low-res originals.
        secondaryZoomLevel: (level) => Math.min(1, level.fit * 3),
        maxZoomLevel: 1,
        allowPanToNext: false,
        pinchToClose: false,
        closeOnVerticalDrag: false,
        imageClickAction: 'zoom',
        bgClickAction: 'close',
        tapAction: (_, event) => {
          if (!(event.target as HTMLElement).closest('.pswp__img')) pswp.close()
        },
        doubleTapAction: 'zoom',
        escKey: true,
        arrowKeys: images.length > 1,
        trapFocus: true,
        returnFocus: false,
        counter: images.length > 1,
        arrowPrev: images.length > 1,
        arrowNext: images.length > 1,
        closeTitle: t('navigation.close'),
        zoomTitle: t('imageViewer.zoomIn'),
        arrowPrevTitle: t('imageViewer.previous'),
        arrowNextTitle: t('imageViewer.next'),
        errorMsg: t('imageViewer.error'),
        closeSVG: icon('<path d="m6 6 12 12M6 18 18 6"/>'),
        zoomSVG: icon(
          '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6"/><path class="pswp__zoom-icn-bar-v" d="M10 7v6"/>',
        ),
        arrowPrevSVG: icon('<path d="m14 5-7 7 7 7M7 12h14"/>'),
        arrowNextSVG: icon('<path d="m10 5 7 7-7 7M3 12h14"/>'),
        paddingFn: (viewport) => {
          const mobile = viewport.x < 600
          const side = mobile ? 12 : Math.round(viewport.x * 0.06)
          const top = mobile ? 64 : 80
          const metadataSpace =
            metadata && !metadata.hidden
              ? viewport.y - metadata.getBoundingClientRect().top
              : 0
          const bottom = Math.ceil(metadataSpace) + (mobile ? 16 : 32)
          pswp.element?.style.setProperty('--viewer-top-space', `${top}px`)
          pswp.element?.style.setProperty(
            '--viewer-bottom-space',
            `${bottom}px`,
          )
          return { top, bottom, left: side, right: side }
        },
      })
      viewer = pswp

      function renderMetadata() {
        if (!metadata) return
        const asset = images[pswp.currIndex]
        if (!asset) return
        metadata.replaceChildren()
        const source = asset.sourceId
          ? getSourceById(locale.value, asset.sourceId)
          : undefined
        const presentation = normalizeMediaCaption(
          asset,
          source,
          asset.sourceId
            ? getSourceById(locale.value === 'ru' ? 'en' : 'ru', asset.sourceId)
            : undefined,
        )
        if (presentation.caption) {
          const paragraph = document.createElement('p')
          paragraph.className = 'media-caption__text'
          paragraph.textContent = presentation.caption
          metadata.append(paragraph)
        }
        if (presentation.attribution || presentation.sourceLabel) {
          const paragraph = document.createElement('p')
          paragraph.className = 'media-caption__attribution'
          paragraph.textContent = presentation.attribution
          if (presentation.attribution && presentation.sourceLabel)
            paragraph.append(' · ')
          if (presentation.sourceLabel) {
            const attribution = document.createElement(
              presentation.sourceUrl ? 'a' : 'span',
            )
            if (
              attribution instanceof HTMLAnchorElement &&
              presentation.sourceUrl
            )
              attribution.href = presentation.sourceUrl
            attribution.textContent = presentation.sourceLabel
            paragraph.append(attribution)
          }
          metadata.append(paragraph)
        }
        metadata.hidden = !metadata.childNodes.length
        metadata.scrollTop = 0
        pswp.element?.setAttribute('aria-label', t('imageViewer.label'))
      }

      function updateZoomLabel() {
        const slide = pswp.currSlide
        const button = pswp.element?.querySelector<HTMLButtonElement>(
          '.pswp__button--zoom',
        )
        if (!slide || !button) return
        const zoomed = slide.currZoomLevel > slide.zoomLevels.initial + 0.001
        const label = t(zoomed ? 'imageViewer.zoomOut' : 'imageViewer.zoomIn')
        button.title = label
        button.setAttribute('aria-label', label)
      }

      pswp.on('uiRegister', () => {
        pswp.ui?.registerElement({
          name: 'metadata',
          className: 'museum-viewer__metadata',
          appendTo: 'root',
          onInit: (element) => {
            metadata = element
            element.setAttribute('aria-live', 'polite')
            element.setAttribute('aria-atomic', 'true')
            element.addEventListener('pointerdown', (event) =>
              event.stopPropagation(),
            )
            element.addEventListener('wheel', (event) =>
              event.stopPropagation(),
            )
            renderMetadata()
          },
        })
      })
      pswp.on('change', renderMetadata)
      pswp.on('zoomPanUpdate', updateZoomLabel)
      pswp.on('afterInit', () => {
        background = [...document.body.children]
          .filter(
            (element): element is HTMLElement =>
              element instanceof HTMLElement && element !== pswp.element,
          )
          .map((element) => ({ element, inert: element.inert }))
        background.forEach(({ element }) => {
          element.inert = true
        })
        document.body.style.overflow = 'hidden'
        if (metadata) {
          observer = new ResizeObserver(() => pswp.updateSize(true))
          observer.observe(metadata)
        }
        updateZoomLabel()
      })
      pswp.on('bindEvents', () => {
        pswp.element
          ?.querySelector<HTMLButtonElement>('.pswp__button--close')
          ?.focus()
      })
      pswp.on('keydown', (event) => {
        if (event.originalEvent.key !== 'Tab') return
        event.preventDefault()
        event.originalEvent.preventDefault()
        const controls = [
          ...(pswp.element?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href]',
          ) ?? []),
        ].filter(
          (element) =>
            element.getClientRects().length &&
            getComputedStyle(element).visibility !== 'hidden',
        )
        const active = controls.indexOf(document.activeElement as HTMLElement)
        const next =
          active < 0
            ? event.originalEvent.shiftKey
              ? controls.length - 1
              : 0
            : (active +
                (event.originalEvent.shiftKey ? -1 : 1) +
                controls.length) %
              controls.length
        controls[next]?.focus()
      })
      pswp.on('wheel', (event) => {
        if (
          (event.originalEvent.target as HTMLElement).closest(
            '.museum-viewer__metadata',
          )
        )
          event.preventDefault()
      })
      pswp.on('destroy', () => {
        observer?.disconnect()
        background.forEach(({ element, inert }) => {
          element.inert = inert
        })
        document.body.style.overflow = previousOverflow
        viewer = undefined
        if (trigger.isConnected) trigger.focus({ preventScroll: true })
      })
      pswp.init()
    } catch {
      viewer?.destroy()
      if (currentRequest === request) error.value = t('imageViewer.error')
    } finally {
      if (currentRequest === request) loading.value = false
    }
  }

  return { open, loading, error }
}
