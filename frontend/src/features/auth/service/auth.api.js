import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  withCredentials: true, // Include cookies in requests
});

export async function register(username,email, password) {
  try {
    const response = await api.post("/register", { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
}

export async function login(email, password) {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
}

export async function logout() {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
}
