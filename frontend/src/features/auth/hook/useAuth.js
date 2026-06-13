import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { register, login, logout, quickLogin, getCurrentUser as fetchCurrentUser } from "../service/auth.api";
import {
  setUser,
  setIsAuthenticated,
  setLoading,
  setError,
} from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  const registerUser = useCallback(async (username, email, password) => {
    try {
      dispatch(setLoading(true));
      const response = await register(username, email, password);
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const loginUser = useCallback(async (email, password) => {
    try {
      dispatch(setLoading(true));
      const response = await login(email, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const quickLoginUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await quickLogin();
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await logout();
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      localStorage.removeItem("token");
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const getCurrentUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetchCurrentUser();
      dispatch(setUser(response.user));
      dispatch(setIsAuthenticated(true));
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
      localStorage.removeItem("token");
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  return {
    registerUser,
    loginUser,
    quickLoginUser,
    logoutUser,
    getCurrentUser,
  };
}
