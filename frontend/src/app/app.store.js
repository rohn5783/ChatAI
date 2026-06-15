import {  configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/auth.slice'
import chatReducer from '../chat/chat.slice'
import memoryReducer from '../features/memory/memory.slice'
export  const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    memory: memoryReducer,
  }
})

