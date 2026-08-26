const API_URL = "/api";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const fetchPosts = () => request("/posts/");

export const createPost = (data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("latitude", data.latitude);
  formData.append("longitude", data.longitude);
  if (data.image) {
    formData.append("image", data.image);
  }
  return request("/posts/", { method: "POST", body: formData });
};

export const markPostSeen = (id) =>
  request(`/posts/${id}/seen/`, { method: "POST" });
