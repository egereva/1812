export interface MapLocation {
  center?: [number, number]
  zoom?: number
  bounds?: [[number, number], [number, number]]
}

export interface YMapInstance {
  addChild(child: unknown): YMapInstance
  removeChild(child: unknown): YMapInstance
  setLocation(location: MapLocation): void
  destroy(): void
}

export interface YMaps3Api {
  ready: Promise<void>
  YMap: new (
    element: HTMLElement,
    options: { location: MapLocation },
  ) => YMapInstance
  YMapDefaultSchemeLayer: new () => unknown
  YMapDefaultFeaturesLayer: new () => unknown
  YMapMarker: new (
    options: { coordinates: [number, number]; zIndex?: number },
    element: HTMLElement,
  ) => unknown
  YMapListener: new (options: {
    onUpdate: (event: { location: { zoom: number } }) => void
    onClick?: () => void
  }) => unknown
}

let loading: Promise<YMaps3Api> | undefined
let loadedLanguage: string | undefined

export function loadYandexMaps(key: string, language: string) {
  if (loading) {
    if (loadedLanguage !== language)
      return Promise.reject(new Error('Map language changed'))
    return loading
  }
  loadedLanguage = language
  loading = new Promise<YMaps3Api>((resolve, reject) => {
    const script = document.createElement('script')
    const url = new URL('https://api-maps.yandex.ru/v3/')
    url.searchParams.set('apikey', key)
    url.searchParams.set('lang', language)
    script.src = url.toString()
    script.async = true
    script.dataset.mapApi = 'yandex-3'
    const timeout = window.setTimeout(() => fail(), 12000)
    function fail() {
      window.clearTimeout(timeout)
      script.remove()
      loading = undefined
      loadedLanguage = undefined
      reject(new Error('Map unavailable'))
    }
    script.onerror = fail
    script.onload = () => {
      const api = (window as unknown as { ymaps3?: YMaps3Api }).ymaps3
      if (!api) return fail()
      api.ready.then(() => {
        window.clearTimeout(timeout)
        resolve(api)
      }, fail)
    }
    document.head.append(script)
  })
  return loading
}
