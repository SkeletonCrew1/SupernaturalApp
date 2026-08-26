import { useState, useEffect } from "react";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 300;

function validate({ name, description, coordsLat, coordsLng }) {
  if (!name.trim()) return "Please enter a name.";
  if (!description.trim()) return "Please enter a description.";
  if (name.length > NAME_MAX) return `Name must be under ${NAME_MAX} characters.`;
  if (description.length > DESCRIPTION_MAX) return `Description must be under ${DESCRIPTION_MAX} characters.`;
  if (coordsLat === "" || coordsLng === "") return "Latitude and longitude are required.";
  const latNum = Number(coordsLat);
  const lngNum = Number(coordsLng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return "Latitude and longitude must be numbers.";
  if (latNum < -90 || latNum > 90) return "Latitude must be between -90 and 90.";
  if (lngNum < -180 || lngNum > 180) return "Longitude must be between -180 and 180.";
  return "";
}

export function usePostForm({ lat, lng, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coordsLat, setCoordsLat] = useState(lat);
  const [coordsLng, setCoordsLng] = useState(lng);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCoordsLat(lat);
    setCoordsLng(lng);
  }, [lat, lng]);

  const handleSubmit = async () => {
    const validationError = validate({ name, description, coordsLat, coordsLng });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ name, description, latitude: coordsLat, longitude: coordsLng, image });
      setName("");
      setDescription("");
      setImage(null);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("Failed to create post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name, setName,
    description, setDescription,
    coordsLat, setCoordsLat,
    coordsLng, setCoordsLng,
    image, setImage,
    submitting, error,
    handleSubmit,
    DESCRIPTION_MAX,
  };
}
