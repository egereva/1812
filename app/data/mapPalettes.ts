// Approved Museum Graphite customization, official JS API 3.0 subset.
// https://yandex.com/maps-api/docs/js-api/map/customization.html
export interface MapCustomizationRule {
  tags?: { any?: string[]; all?: string[]; none?: string[] }
  elements?:
    | 'geometry'
    | 'geometry.fill'
    | 'geometry.outline'
    | 'label'
    | 'label.icon'
    | 'label.text.fill'
    | 'label.text.outline'
  stylers: {
    color?: string
    saturation?: number
    opacity?: number
    visibility?: 'off'
  }[]
}

const colors = {
  ground: '#292c2e',
  blocks: '#303436',
  buildings: '#383c3e',
  outline: '#414648',
  water: '#394750',
  parks: '#323d38',
  roads: '#646b6d',
  minorRoads: '#4d5456',
  labels: '#c5cbcc',
}

function rules(palette: typeof colors): MapCustomizationRule[] {
  return [
    { stylers: [{ saturation: -1 }] },
    { elements: 'geometry.fill', stylers: [{ color: palette.ground }] },
    { elements: 'geometry.outline', stylers: [{ color: palette.outline }] },
    {
      tags: { any: ['urban_area'] },
      elements: 'geometry.fill',
      stylers: [{ color: palette.blocks }],
    },
    {
      tags: { any: ['structure'] },
      elements: 'geometry.fill',
      stylers: [{ color: palette.buildings }],
    },
    {
      tags: { any: ['park', 'vegetation', 'national_park'] },
      elements: 'geometry.fill',
      stylers: [{ color: palette.parks }],
    },
    {
      tags: { any: ['water'] },
      elements: 'geometry',
      stylers: [{ color: palette.water }],
    },
    {
      tags: { any: ['road'] },
      elements: 'geometry.fill',
      stylers: [{ color: palette.roads }],
    },
    {
      tags: { any: ['road_minor', 'road_limited', 'path'] },
      elements: 'geometry.fill',
      stylers: [{ color: palette.minorRoads }],
    },
    { elements: 'label.text.fill', stylers: [{ color: palette.labels }] },
    { elements: 'label.text.outline', stylers: [{ color: palette.ground }] },
    {
      elements: 'label.icon',
      stylers: [{ saturation: -1 }, { opacity: 0.35 }],
    },
    {
      tags: { any: ['poi'] },
      elements: 'label',
      stylers: [{ visibility: 'off' }],
    },
    {
      tags: { any: ['transit_location'] },
      elements: 'label.icon',
      stylers: [{ visibility: 'off' }],
    },
  ]
}

export const museumGraphiteCustomization = rules(colors)
