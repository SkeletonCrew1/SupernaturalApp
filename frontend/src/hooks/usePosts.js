import { useState, useEffect, useCallback } from "react";
import { fetchPosts, createPost, markPostSeen } from "../api/posts";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch((err) => console.error("Failed to load posts:", err))
      .finally(() => setLoading(false));
  }, []);

  const addPost = useCallback(async (data) => {
    const post = await createPost(data);
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const markSeen = useCallback(async (id) => {
    const { seen_count } = await markPostSeen(id);
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, seen_count, already_seen: true } : p))
    );
    return { seen_count };
  }, []);

  return { posts, loading, addPost, markSeen };
}
