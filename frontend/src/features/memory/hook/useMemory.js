import { useCallback } from "react";
import { useDispatch } from "react-redux";
import * as memoryApi from "../service/memory.api";
import {
  setMemories,
  addMemoryToState,
  updateMemoryInState,
  deleteMemoryFromState,
  clearMemoriesState,
  setLoading,
  setError,
} from "../memory.slice";

export function useMemory() {
  const dispatch = useDispatch();

  const fetchMemories = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await memoryApi.getMemories();
      dispatch(setMemories(data.memories || []));
      dispatch(setLoading(false));
      return data.memories;
    } catch (err) {
      dispatch(setError(err.message || "Failed to load memories"));
      dispatch(setLoading(false));
      throw err;
    }
  }, [dispatch]);

  const addMemory = useCallback(async (memoryData) => {
    try {
      dispatch(setLoading(true));
      const data = await memoryApi.createMemory(memoryData);
      dispatch(addMemoryToState(data.memory));
      dispatch(setLoading(false));
      return data.memory;
    } catch (err) {
      dispatch(setError(err.message || "Failed to add memory"));
      dispatch(setLoading(false));
      throw err;
    }
  }, [dispatch]);

  const editMemory = useCallback(async (id, memoryData) => {
    try {
      dispatch(setLoading(true));
      const data = await memoryApi.updateMemory(id, memoryData);
      dispatch(updateMemoryInState(data.memory));
      dispatch(setLoading(false));
      return data.memory;
    } catch (err) {
      dispatch(setError(err.message || "Failed to update memory"));
      dispatch(setLoading(false));
      throw err;
    }
  }, [dispatch]);

  const removeMemory = useCallback(async (id) => {
    try {
      dispatch(setLoading(true));
      await memoryApi.deleteMemory(id);
      dispatch(deleteMemoryFromState(id));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.message || "Failed to delete memory"));
      dispatch(setLoading(false));
      throw err;
    }
  }, [dispatch]);

  const clearAll = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await memoryApi.clearAllMemories();
      dispatch(clearMemoriesState());
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.message || "Failed to clear memories"));
      dispatch(setLoading(false));
      throw err;
    }
  }, [dispatch]);

  return {
    fetchMemories,
    addMemory,
    editMemory,
    removeMemory,
    clearAll,
  };
}
