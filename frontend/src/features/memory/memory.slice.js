import { createSlice } from '@reduxjs/toolkit';

const memorySlice = createSlice({
  name: 'memory',
  initialState: {
    memories: [],
    loading: false,
    error: null,
  },
  reducers: {
    setMemories: (state, action) => {
      state.memories = action.payload;
    },
    addMemoryToState: (state, action) => {
      const existsIdx = state.memories.findIndex(m => m.key === action.payload.key);
      if (existsIdx > -1) {
        state.memories[existsIdx] = action.payload;
      } else {
        state.memories.push(action.payload);
      }
    },
    updateMemoryInState: (state, action) => {
      const idx = state.memories.findIndex(m => m._id === action.payload._id);
      if (idx > -1) {
        state.memories[idx] = action.payload;
      }
    },
    deleteMemoryFromState: (state, action) => {
      state.memories = state.memories.filter(m => m._id !== action.payload);
    },
    clearMemoriesState: (state) => {
      state.memories = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMemories,
  addMemoryToState,
  updateMemoryInState,
  deleteMemoryFromState,
  clearMemoriesState,
  setLoading,
  setError,
} = memorySlice.actions;

export default memorySlice.reducer;
