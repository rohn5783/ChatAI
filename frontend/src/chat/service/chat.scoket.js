const API_BASE_URL = "http://localhost:3000/api/chats";

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

export function getChats() {
  return request("/");
}

export function getChatMessages(chatId) {
  return request(`/${chatId}/messages`);
}

export function sendChatMessage({ message, chatId, fileIds }) {
  return request("/message", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(chatId ? { chatId } : {}),
      ...(fileIds ? { fileIds } : {}),
    }),
  });
}
