const AUTH_URL = "/api/auth";

function postForm(url, data) {
  return fetch(`${AUTH_URL}${url}`, {
    method: "POST",
    credentials: "include",
    body: new URLSearchParams(data),
  });
}

export function verifyPassword(password) {
  return postForm("/verify-password", {
    password,
  });
}

export async function login(email, password) {
  const res = await postForm("/login", {
    email,
    password,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export function register(email, password, invite_token) {
  return postForm("/register", {
    email,
    password,
    invite_token,
  });
}

export function logout() {
  return fetch(`${AUTH_URL}/logout`, {
    credentials: "include",
  });
}

export function session() {
  return fetch(`${AUTH_URL}/session`, {
    credentials: "include",
  });
}
