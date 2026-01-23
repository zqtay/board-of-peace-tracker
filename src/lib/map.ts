import type { GeoJsonObject } from "geojson";
import L from 'leaflet';

export const SMALL_COUNTRIES_CODES = [
  'VAT', 'MCO', 'NRU', 'TUV', 'SMR',
  'LIE', 'MHL', 'KNA', 'MDV', 'MLT',
  'GRD', 'VCT', 'BRB', 'ATG', 'SYC',
  'PLW', 'AND', 'LCA', 'FSM', 'SGP',
  'TON', 'DMA', 'BHR', 'KIR', 'STP'
];

export const getCenter = (geometry: GeoJsonObject): [number, number] => {
  if (!geometry) return [0, 0];

  // Create a temporary Leaflet layer to utilize its .getBounds().getCenter() method
  // This avoids complex math or external libraries like Turf.js
  const layer = L.geoJSON(geometry);
  const center = layer.getBounds().getCenter();
  return [center.lat, center.lng];
};