import type { MapCustomizationRule } from './mapPalettes'

// Approved Museum Ivory, Homepage preview only.
// https://yandex.com/maps-api/docs/js-api/map/customization.html
export const museumIvoryColors = {
  ground: '#eeece5',
  blocks: '#e3e0d7',
  buildings: '#d8d5ce',
  outline: '#c5c3ba',
  water: '#bbc9cc',
  parks: '#d0d6c7',
  roads: '#9a9c98',
  minorRoads: '#b8bab3',
  labels: '#595d58',
}

function rules(palette: typeof museumIvoryColors): MapCustomizationRule[] {
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

export const museumIvoryCustomization = rules(museumIvoryColors)
