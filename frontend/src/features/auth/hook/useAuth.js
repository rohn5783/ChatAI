import { useDispatch } from "react-redux";
import { register, login, logout, getCurrentUser  } from "../service/auth.api";
import {
  setUser,
  setIsAuthenticated,
  setLoading,
  setError,
} from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function registerUser(username, email, password) {
    try {
      dispatch(setLoading(true));
      const response = await register(username, email, password);
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
  }

  async function loginUser(email, password) {
    try {
      dispatch(setLoading(true));
      const response = await login(email, password);
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
  }

  async function logoutUser() {
    try {
      dispatch(setLoading(true));
      const response = await logout();
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
  }

  async function getCurrentUser() {
    try {
      dispatch(setLoading(true));
      const response = await getCurrentUser();
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
    }

  return {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
  };
}
