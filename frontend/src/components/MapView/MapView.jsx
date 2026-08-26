import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_TILE_URL, VioletIcon } from "../../data/mapConfig";
import { ClickHandler, CustomZoomControls } from "../MapControls/MapControls";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import logo from "../../assets/images/logo.png";

export default function MapView({ onMapClick, posts = [], onMarkerClick, user }) {
  return (
    <div className="map-view">
      <div className="map-view__logo">
        <img src={logo} alt="Supernatural Logo" />
      </div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="map-view__map"
      >
        <TileLayer url={MAP_TILE_URL} />
        <CustomZoomControls />
        <ClickHandler onMapClick={onMapClick} />
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.latitude, post.longitude]}
            icon={VioletIcon}
            eventHandlers={{
              click: () => onMarkerClick(post.id),
              mouseover: (e) => e.target.openPopup(),
              mouseout: (e) => e.target.closePopup(),
            }}
          >
            <Popup>
              <strong>{post.name.length > 40 ? `${post.name.slice(0, 40)}…` : post.name}</strong>
              <p>
                {post.description.length > 80
                  ? `${post.description.slice(0, 80)}…`
                  : post.description}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button type="button" className="map-view__votes-btn" onClick={() => window.location.href = '/votes'} aria-label="voting court">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#ffffff"
          width="30"
          height="30"
        >
          <path d="M8.25 15.5C8.25 15.9142 8.58579 16.25 9 16.25C9.41421 16.25 9.75 15.9142 9.75 15.5H8.25ZM9.75 11.5C9.75 11.0858 9.41421 10.75 9 10.75C8.58579 10.75 8.25 11.0858 8.25 11.5H9.75ZM11.75 15.5C11.75 15.9142 12.0858 16.25 12.5 16.25C12.9142 16.25 13.25 15.9142 13.25 15.5H11.75ZM13.25 9.5C13.25 9.08579 12.9142 8.75 12.5 8.75C12.0858 8.75 11.75 9.08579 11.75 9.5H13.25ZM15.25 15.5C15.25 15.9142 15.5858 16.25 16 16.25C16.4142 16.25 16.75 15.9142 16.75 15.5H15.25ZM16.75 11.5C16.75 11.0858 16.4142 10.75 16 10.75C15.5858 10.75 15.25 11.0858 15.25 11.5H16.75ZM9.75 15.5V11.5H8.25V15.5H9.75ZM13.25 15.5V9.5H11.75V15.5H13.25ZM16.75 15.5V11.5H15.25V15.5H16.75Z"/>
        </svg>
      </button>
      {user?.status !== "copper" && (
      <button type="button" className="map-view__add-btn" onClick={() => onMapClick(null, null, null)}>
        + Add new post
      </button>
      )}
    </div>
  );
}
