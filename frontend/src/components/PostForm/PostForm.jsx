import React from "react";
import { usePostForm } from "../../hooks/usePostForm";
import "./PostForm.css";

export default function PostForm({ lat, lng, locked, onSubmit }) {
  const {
    name, setName,
    description, setDescription,
    coordsLat, setCoordsLat,
    coordsLng, setCoordsLng,
    image, setImage,
    submitting, error,
    handleSubmit,
    DESCRIPTION_MAX,
  } = usePostForm({ lat, lng, onSubmit });

  return (
    <div className="post-form">
      <label className="post-form__upload">
        {image ? image.name : "Upload picture"}
        <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0] ?? null)} />
      </label>
      <input className="post-form__input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="post-form__coords">
        <input className="post-form__input" placeholder="Latitude" value={coordsLat ?? ""} readOnly={locked} inputMode="decimal" onChange={(e) => setCoordsLat(e.target.value)} />
        <input className="post-form__input" placeholder="Longitude" value={coordsLng ?? ""} readOnly={locked} inputMode="decimal" onChange={(e) => setCoordsLng(e.target.value)} />
      </div>
      <textarea className="post-form__textarea" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <p className="post-form__char-count">{description.length}/{DESCRIPTION_MAX}</p>
      {error && <p className="post-form__error">{error}</p>}
      <button type="button" className="post-form__submit" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Publishing…" : "Publish"}
      </button>
    </div>
  );
}
