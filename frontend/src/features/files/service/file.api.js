const API_BASE_URL = "http://localhost:3000/api/files";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
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

export function getFiles() {
  return request("/");
}

export function deleteFile(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}

// Custom file upload request to track progress or handle Form Data correctly
export async function uploadFile(fileObject) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", fileObject);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw data;
  }

  return data;
}
