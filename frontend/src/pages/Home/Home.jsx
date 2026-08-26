import React from "react";
import MapView from "../../components/MapView/MapView";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSidebarMode } from "../../hooks/useSidebarMode";
import { usePosts } from "../../hooks/usePosts";
import "./Home.css";

export default function Home({ user, setUser }) {
  const { posts, addPost, markSeen } = usePosts();

  const {
    sidebarMode,
    handleMapClick: rawHandleMapClick,
    handleMarkerClick,
    resetMode
  } = useSidebarMode();

  const handleMapClick = (lat, lng) => {
    if (user?.status === "copper") return;
    rawHandleMapClick(lat, lng);
  };

  const handleCreatePost = async (data) => {
    await addPost(data);
    resetMode();
  };

  return (
    <div className="home-shell">
      <div className="home-frame">
        <MapView
          onMapClick={handleMapClick}
          posts={posts}
          onMarkerClick={handleMarkerClick}
          user={user}
        />
        <Sidebar
          user={user}
          setUser={setUser}
          mode={sidebarMode}
          posts={posts}
          onCreatePost={handleCreatePost}
          onSeenPost={markSeen}
        />
      </div>
    </div>
  );
}
