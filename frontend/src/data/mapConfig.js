import L from "leaflet";

const VITE_CARTO_API_KEY = process.env.VITE_CARTO_API_KEY;
export const DEFAULT_CENTER = [49.8397, 24.0297];
export const DEFAULT_ZOOM = 4;
export const MAP_TILE_URL = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(VITE_CARTO_API_KEY)}`;

export const VioletIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
