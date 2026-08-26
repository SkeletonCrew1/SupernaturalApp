import React, { useState, useEffect } from "react";
import "./PostDetails.css";

export default function PostDetails({ post, onSeen }) {
  const [alreadySeen, setAlreadySeen] = useState(() => post?.already_seen ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [seenCount, setSeenCount] = useState(() => post?.seen_count ?? 0);

  useEffect(() => {
    setAlreadySeen(post?.already_seen ?? false);
    setSeenCount(post?.seen_count ?? 0);
  }, [post]);

  if (!post) return null;

  const handleSeenClick = async () => {
    setSubmitting(true);
    try {
      const result = await onSeen(post.id);
      setAlreadySeen(true);
      if (result?.seen_count !== undefined) {
        setSeenCount(result.seen_count);
      }
    } catch (err) {
      setAlreadySeen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-details custom-scrollbar">
      {post.image_url && (
        <div className="post-details__image-wrapper">
          <div
            className="post-details__image-bg"
            style={{ backgroundImage: `url(${post.image_url})` }}
          />
          <img className="post-details__image" src={post.image_url} alt={post.name} />
        </div>
      )}
      <h3 className="post-details__name">{post.name}</h3>
      <p className="post-details__description">{post.description}</p>
      <p className="post-details__coords">
        {post.latitude}, {post.longitude}
      </p>
      <p className="post-details__seen-count">👁 {seenCount} {seenCount === 1 ? "person has" : "people have"} seen this too
      </p>
      <button
        type="button"
        className={`post-details__seen-btn ${alreadySeen ? "post-details__seen-btn--disabled" : ""}`}
        onClick={handleSeenClick}
        disabled={alreadySeen || submitting}
      >
        {alreadySeen ? "You saw this too ✓" : "I saw that too!"}
      </button>
    </div>
  );
}
