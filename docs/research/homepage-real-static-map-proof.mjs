// Audit proof only. Not imported by production code; no geographic/network data is fetched.
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { getPlaces } from '../../shared/content/index.ts'
import { statusLayer } from '../../app/data/mapPresentation.ts'

const places = getPlaces('ru')
const en = getPlaces('en')
assert.equal(places.length, 13)
assert.deepEqual(
  places.map((p) => p.coordinates),
  en.map((p) => p.coordinates),
)
const before = JSON.stringify(places)
const radians = Math.PI / 180,
  radius = 6371008.8
const bbox = {
  south: Math.min(...places.map((p) => p.coordinates.lat)),
  north: Math.max(...places.map((p) => p.coordinates.lat)),
  west: Math.min(...places.map((p) => p.coordinates.lon)),
  east: Math.max(...places.map((p) => p.coordinates.lon)),
}
const phi0 = (bbox.south + bbox.north) / 2,
  lambda0 = (bbox.west + bbox.east) / 2
const projected = places.map((p) => ({
  id: p.id,
  layer: statusLayer[p.historicalStatus],
  east:
    radius * (p.coordinates.lon - lambda0) * radians * Math.cos(phi0 * radians),
  north: radius * (p.coordinates.lat - phi0) * radians,
}))
const widthMetres =
  Math.max(...projected.map((p) => p.east)) -
  Math.min(...projected.map((p) => p.east))
const heightMetres =
  Math.max(...projected.map((p) => p.north)) -
  Math.min(...projected.map((p) => p.north))
const scale = Math.min(560 / widthMetres, 240 / heightMetres)
const raw = projected.map((p) => ({
  id: p.id,
  layer: p.layer,
  x: 320 + scale * p.east,
  y: 160 - scale * p.north,
}))
const threshold = (7 * 640) / 288
const roots = raw.map((_, i) => i)
function root(i) {
  return roots[i] === i ? i : (roots[i] = root(roots[i]))
}
for (let i = 0; i < raw.length; i++)
  for (let j = i + 1; j < raw.length; j++) {
    if (Math.hypot(raw[i].x - raw[j].x, raw[i].y - raw[j].y) < threshold)
      roots[root(j)] = root(i)
  }
const groups = new Map()
raw.forEach((p, i) => {
  const key = root(i)
  groups.set(key, [...(groups.get(key) ?? []), p])
})
const displayed = [...groups.values()].flatMap((group) => {
  if (group.length === 1)
    return group.map((p) => ({ ...p, anchorX: p.x, anchorY: p.y }))
  const cx = group.reduce((sum, p) => sum + p.x, 0) / group.length
  const cy = group.reduce((sum, p) => sum + p.y, 0) / group.length
  return [...group]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((p, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / group.length
      return {
        ...p,
        anchorX: p.x,
        anchorY: p.y,
        x: cx + 20 * Math.cos(angle),
        y: cy + 20 * Math.sin(angle),
      }
    })
})
const mercator = places.map((p) => ({
  x: radius * (p.coordinates.lon - lambda0) * radians,
  y:
    radius *
    (Math.log(Math.tan(Math.PI / 4 + (p.coordinates.lat * radians) / 2)) -
      Math.log(Math.tan(Math.PI / 4 + (phi0 * radians) / 2))),
}))
const mercWidth =
  Math.max(...mercator.map((p) => p.x)) - Math.min(...mercator.map((p) => p.x))
const deviation = Math.max(
  ...raw.map((p, i) =>
    Math.hypot(
      p.x - (320 + (mercator[i].x * 560) / mercWidth),
      p.y - (160 - (mercator[i].y * 560) / mercWidth),
    ),
  ),
)
let minGap = Infinity
for (let i = 0; i < displayed.length; i++)
  for (let j = i + 1; j < displayed.length; j++)
    minGap = Math.min(
      minGap,
      Math.hypot(
        displayed[i].x - displayed[j].x,
        displayed[i].y - displayed[j].y,
      ),
    )
assert.equal(new Set(displayed.map((p) => p.id)).size, 13)
assert.ok(minGap > 11, '11-unit points must remain separate')
assert.ok(
  displayed.every(
    (p) => p.x >= 40 - 1e-9 && p.x <= 600 + 1e-9 && p.y >= 40 && p.y <= 280,
  ),
)
assert.equal(JSON.stringify(places), before)
function svg(points, fan = false) {
  const lines = fan
    ? points
        .filter((p) => p.anchorX !== p.x || p.anchorY !== p.y)
        .map(
          (p) =>
            `<line x1="${p.anchorX.toFixed(2)}" y1="${p.anchorY.toFixed(2)}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" stroke="#99958b" stroke-width="0.8" stroke-dasharray="2 2"/>`,
        )
        .join('')
    : ''
  const circles = points
    .map(
      (p) =>
        `<circle data-place-id="${p.id}" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="5.5" fill="${p.layer === '1812' ? '#1c1b19' : '#702837'}"/>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" role="img" aria-label="Coordinate audit: 13 Places, 6 in 1812, 7 in Memory. ${fan ? 'Dense points separated using explicit screen offsets.' : 'Raw positions; some points overlap.'}"><g aria-hidden="true"><path d="M40 40H600M40 280H600" stroke="#d8d3c8" fill="none"/><text x="40" y="26" font-family="sans-serif" font-size="12" fill="#666158">N ↑</text><path d="M40 264V268H${(40 + 1000 * scale).toFixed(2)}V264" stroke="#666158" fill="none"/><text x="40" y="256" font-family="sans-serif" font-size="12" fill="#666158">1 km</text>${lines}${circles}</g></svg>`
}
const rawSvg = svg(raw),
  fanSvg = svg(displayed, true)
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Homepage coordinate proof — audit only</title><style>body{margin:32px;background:#f3f0e8;color:#1c1b19;font:16px/1.5 system-ui}section{margin:32px 0}svg{display:block;width:100%;height:auto}h1{font:32px Georgia,serif}h2{font-size:18px}.desktop{width:734px;max-width:100%}.mobile390{width:358px;max-width:100%}.mobile320{width:288px;max-width:100%}.mobile390 svg text,.mobile320 svg text{font-size:28px}p{max-width:75ch;font-size:14px;color:#666158}</style><h1>Coordinate-layout proof · audit only</h1><p>Projection uses the approved Place catalog. Graphite = 1812; burgundy = Memory. No basemap, roads or river. Reference rules are framing; dashed spokes are display displacement guides, not routes.</p><section class="desktop"><h2>Raw true anchors · desktop</h2>${rawSvg}<p>13 records, 12 coordinate pairs; the dense group is visibly occluded.</p></section><section class="desktop"><h2>Proposed static screen fan · desktop</h2>${fanSvg}<p>Seven dense points are separated for legibility. Leader lines start at each actual projected anchor. No links or labels attach these points to the three editorial Place links.</p></section><section class="mobile390"><h2>390px viewport · 358px field</h2>${fanSvg}</section><section class="mobile320"><h2>320px viewport · 288px field</h2>${fanSvg}</section><p>This is a geometric proof, not a production UI mockup. It does not change the Homepage or load map data.</p></html>`
writeFileSync('docs/research/homepage-real-static-map-proof.html', html)
writeFileSync('docs/research/homepage-real-static-map-proof.svg', fanSvg)
const report = {
  bbox,
  phi0,
  lambda0,
  widthMetres,
  heightMetres,
  scale,
  raw,
  displayed,
  groups: [...groups.values()].map((g) => g.map((p) => p.id)),
  exactPositions: new Set(places.map((p) => JSON.stringify(p.coordinates)))
    .size,
  maximumMercatorDifferenceViewboxUnits: deviation,
  minimumDisplayedCentreGapViewboxUnits: minGap,
  cost: {
    proofSvgBytes: Buffer.byteLength(fanSvg),
    proofSvgPoints: (fanSvg.match(/<circle /g) ?? []).length,
    geographicAssetDownloads: 0,
  },
}
writeFileSync(
  'docs/research/homepage-real-static-map-proof.json',
  JSON.stringify(report, null, 2) + '\n',
)
console.log(
  JSON.stringify(
    {
      bbox,
      extentKm: [widthMetres / 1000, heightMetres / 1000],
      exactPositions: report.exactPositions,
      groups: report.groups,
      maximumMercatorDifferenceViewboxUnits: deviation,
      minimumDisplayedCentreGapViewboxUnits: minGap,
      cost: report.cost,
    },
    null,
    2,
  ),
)
