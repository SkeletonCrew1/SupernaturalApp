import { useState } from "react";

export function useSidebarMode() {
  const [sidebarMode, setSidebarMode] = useState({ type: "idle" });
  const [addMode, setAddMode] = useState(false);

  const handleMapClick = (lat, lng) => {
    if (lat === null) {
      setSidebarMode({ type: "create", lat: "", lng: "", locked: false });
      setAddMode(true);
      return;
    }
    if (addMode) {
      setSidebarMode((prev) => ({ ...prev, lat, lng }));
      setAddMode(false);
      return;
    }
    setSidebarMode({ type: "create", lat, lng, locked: true });
  };

  const handleMarkerClick = (postId) => {
    setSidebarMode({ type: "view", postId });
  };

  const resetMode = () => setSidebarMode({ type: "idle" });

  return {
    sidebarMode,
    handleMapClick,
    handleMarkerClick,
    resetMode,
  };
}
