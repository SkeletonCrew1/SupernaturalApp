import React, { useRef, useEffect } from "react";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import "./MapControls.css";

export function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function CustomZoomControls() {
  const map = useMap();
  const controlsRef = useRef(null);

  useEffect(() => {
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
    }
  }, []);

  return (
    <div className="map-zoom-controls" ref={controlsRef}>
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        +
      </button>
      <div className="map-zoom-divider" />
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}
