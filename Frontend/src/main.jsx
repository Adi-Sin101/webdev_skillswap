import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import FindSkills from './pages/findskills/FindSkills.jsx'
import Profile from './pages/profile/Profile.jsx'
import MyOffers from './pages/profile/MyOffers.jsx'
import MyRequests from './pages/profile/MyRequests.jsx'
import CompletedActivities from './pages/profile/CompletedActivities.jsx'
import RouteError from './components/RouteError.jsx'
import DiscoverProfiles from './pages/discover/DiscoverProfiles.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <FindSkills />,
      },
      {
        path: '/profile',
        element: <Profile />, // Owner's profile
      },
      {
        path: '/profile/:id',
        element: <Profile />, // Other user's profile
      },
      {
        path: '/my-offers',
        element: <MyOffers />,
      },
      {
        path: '/my-requests',
        element: <MyRequests />,
      },
      {
        path: '/completed-activities',
        element: <CompletedActivities />,
      },
      {
        path: '/discover',
        element: <DiscoverProfiles />,
      },
    ],
  },
  // Auth routes (outside of main app layout)
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteError />,
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <RouteError />,
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)