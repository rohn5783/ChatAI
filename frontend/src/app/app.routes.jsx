import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Dashboard from '../chat/pages/Dashboard';
import Protected from '../features/auth/components/Protected';
import PublicOnly from '../features/auth/components/PublicOnly';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnly>
        <Register />
      </PublicOnly>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  }
])
