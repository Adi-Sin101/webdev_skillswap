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
import MyApplications from './pages/profile/MyApplications.jsx'
import CompletedActivities from './pages/profile/CompletedActivities.jsx'
import Notifications from './pages/notifications/Notifications.jsx'
import OfferDetails from './pages/offers/OfferDetails.jsx'
import RequestDetails from './pages/requests/RequestDetails.jsx'
import ApplicationDetails from './pages/applications/ApplicationDetails.jsx'
import Conversations from './pages/messages/Conversations.jsx'
import Chat from './pages/messages/Chat.jsx'
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
        path: '/my-applications',
        element: <MyApplications />,
      },
      // accepted-swaps removed; functionality consolidated into MyApplications
      {
        path: '/completed-activities',
        element: <CompletedActivities />,
      },
      {
        path: '/notifications',
        element: <Notifications />,
      },
      {
        path: '/conversations',
        element: <Conversations />,
      },
      {
        path: '/chat/:conversationId',
        element: <Chat />,
      },
      {
        path: '/discover',
        element: <DiscoverProfiles />,
      },
      {
        path: '/offer-details/:id',
        element: <OfferDetails />,
      },
      {
        path: '/request-details/:id',
        element: <RequestDetails />,
      },
      {
        path: '/applications/:id',
        element: <ApplicationDetails />,
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