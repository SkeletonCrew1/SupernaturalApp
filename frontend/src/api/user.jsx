const API_BASE = "/api";

export async function getVotes() {
  const res = await fetch(`${API_BASE}/votes/`, {
      method: "GET",
      credentials: "include"
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function newVote(voteData) {
  const res = await fetch(`${API_BASE}/votes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voteData),
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Couldn't create vote");
  }
  return res.json();
}

export async function setVote(voteId, value) {
  const res = await fetch(`${API_BASE}/votes/${voteId}/set_vote/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ res: value }),
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Couldn't set a vote");
  }
  return res.json();
}

export async function checkIP() {
  const res = await fetch(`${API_BASE}/check/`, {
      method: "GET",
      credentials: "include"
  });
  if (res.status === 403) {
    return { isBanned: true };
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { isBanned: false };
}
