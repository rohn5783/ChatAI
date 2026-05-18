import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
   setUser: (state, action) => {
      state.user = action.payload
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  
})

export const { setUser, setIsAuthenticated, setLoading, setError } = authSlice.actions  

export default authSlice.reducer