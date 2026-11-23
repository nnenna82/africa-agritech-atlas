// Builds lib/africa-map.json: the SVG outlines of Africa's 54 countries (plus Western Sahara in grey),
// pre-drawn once so the website does not need to download the whole world map.
// Outlines: Natural Earth via the world-atlas package (public domain).
//
// Usage: node scripts/build-map.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import { feature, merge } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-50m.json");

// Natural Earth uses ISO numeric codes; the Atlas uses ISO-3 letters.
const NUMERIC_TO_ISO3 = {
  "012": "DZA", "024": "AGO", "204": "BEN", "072": "BWA", "854": "BFA", "108": "BDI", "132": "CPV",
  "120": "CMR", "140": "CAF", "148": "TCD", "174": "COM", "178": "COG", "180": "COD", "262": "DJI",
  "818": "EGY", "226": "GNQ", "232": "ERI", "748": "SWZ", "231": "ETH", "266": "GAB", "270": "GMB",
  "288": "GHA", "324": "GIN", "624": "GNB", "384": "CIV", "404": "KEN", "426": "LSO", "430": "LBR",
  "434": "LBY", "450": "MDG", "454": "MWI", "466": "MLI", "478": "MRT", "480": "MUS", "504": "MAR",
  "508": "MOZ", "516": "NAM", "562": "NER", "566": "NGA", "646": "RWA", "678": "STP", "686": "SEN",
  "690": "SYC", "694": "SLE", "706": "SOM", "710": "ZAF", "728": "SSD", "729": "SDN", "834": "TZA",
  "768": "TGO", "788": "TUN", "800": "UGA", "894": "ZMB", "716": "ZWE",
};

// Small island states get a dot so they can be seen and clicked. [longitude, latitude]
const ISLAND_DOTS = {
  CPV: [-23.6, 15.1], STP: [6.6, 0.3], COM: [43.35, -11.7], MUS: [57.55, -20.25], SYC: [55.45, -4.65],
};

const W = 600;
const H = 640;

const countries = JSON.parse(readFileSync("data/countries.json", "utf8"));
const regionOf = Object.fromEntries(countries.map((c) => [c.iso3, c.region]));
const nameOf = Object.fromEntries(countries.map((c) => [c.iso3, c.name]));

const geoms = world.objects.countries.geometries;
const features = [];
for (const [num, iso3] of Object.entries(NUMERIC_TO_ISO3)) {
  const parts = geoms.filter((g) => g.id === num || (iso3 === "SOM" && g.properties.name === "Somaliland"));
  if (!parts.length) throw new Error(`Missing outline for ${iso3}`);
  // Merge Somaliland into Somalia so there is one shape per Atlas country.
  let geometry = parts.length > 1 ? merge(world, parts) : feature(world, parts[0]).geometry;
  // Drop far-off sub-Antarctic islands (South Africa's Prince Edward Islands) so the map stays tight.
  if (geometry.type === "MultiPolygon") {
    geometry = { ...geometry, coordinates: geometry.coordinates.filter((poly) => poly[0].every(([, lat]) => lat > -40)) };
  }
  features.push({ type: "Feature", id: iso3, properties: {}, geometry });
}
const wsah = feature(world, geoms.find((g) => g.id === "732"));

// Fit the projection to the mainland, Madagascar and the island dots.
const dotFeatures = Object.values(ISLAND_DOTS).map((c) => ({ type: "Feature", geometry: { type: "Point", coordinates: c } }));
const projection = geoMercator().fitExtent(
  [[12, 12], [W - 12, H - 12]],
  { type: "FeatureCollection", features: [...features, wsah, ...dotFeatures] },
);
const path = geoPath(projection).digits(1);

const round = (n) => Math.round(n * 10) / 10;
const out = {
  width: W,
  height: H,
  westernSahara: path(wsah),
  // Alphabetical, so keyboard users Tab through countries in name order.
  countries: [...features].sort((a, b) => nameOf[a.id].localeCompare(nameOf[b.id])).map((f) => {
    const [[x0, y0], [x1, y1]] = path.bounds(f);
    const dot = ISLAND_DOTS[f.id] ? projection(ISLAND_DOTS[f.id]).map(round) : null;
    const [cx, cy] = dot ?? projection(geoCentroid(f)).map(round);
    return {
      iso3: f.id,
      name: nameOf[f.id],
      region: regionOf[f.id],
      d: path(f),
      bbox: [round(x0), round(y0), round(x1), round(y1)],
      center: [cx, cy],
      dot,
    };
  }),
};

if (out.countries.some((c) => !c.region)) throw new Error("A country is missing from data/countries.json");
writeFileSync("lib/africa-map.json", JSON.stringify(out));
console.log(`Wrote lib/africa-map.json: ${out.countries.length} countries, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
