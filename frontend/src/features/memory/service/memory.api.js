const API_BASE_URL = "http://localhost:3000/api/memories";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw data;
  }

  return data;
}

export function getMemories() {
  return request("/");
}

export function createMemory(memoryData) {
  return request("/", {
    method: "POST",
    body: JSON.stringify(memoryData),
  });
}

export function updateMemory(id, memoryData) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(memoryData),
  });
}

export function deleteMemory(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}

export function clearAllMemories() {
  return request("/", {
    method: "DELETE",
  });
}
