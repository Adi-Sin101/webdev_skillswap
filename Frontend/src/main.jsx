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
import RouteError from './components/RouteError.jsx'
import DiscoverProfiles from './pages/discover/DiscoverProfiles.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <FindSkills />,
      },
      {
        path: '/profile',
        element: <Profile />,
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
    <RouterProvider router={router} />
  </StrictMode>,
)