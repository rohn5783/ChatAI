const API_BASE_URL = "http://localhost:3000/api/auth";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

export async function register(username,email, password) {
  try {
    return await request("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  } catch (error) {
    throw error.message ? error : new Error("Network error");
  }
}

export async function login(email, password) {
  try {
    return await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    throw error.message ? error : new Error("Network error");
  }
}

export async function quickLogin() {
  try {
    return await request("/quick-login", {
      method: "POST",
    });
  } catch (error) {
    throw error.message ? error : new Error("Network error");
  }
}

export async function logout() {
  try {
    return await request("/logout", {
      method: "POST",
    });
  } catch (error) {
    throw error.message ? error : new Error("Network error");
  }
}

export async function getCurrentUser() {
  try {
    return await request("/me");
  } catch (error) {
    throw error.message ? error : new Error("Network error");
  }
}
