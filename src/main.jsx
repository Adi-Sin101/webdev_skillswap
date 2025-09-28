import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import FindSkills from './pages/findskills/FindSkills.jsx'
import PostRequest from './pages/postrequest/PostRequest.jsx'
import PostOffer from './pages/postoffers/PostOffer.jsx'
import Messages from './pages/messages/Messages.jsx'
import Profile from './pages/profile/Profile.jsx'
import RouteError from './components/RouteError.jsx'

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
        path: '/postrequest',
        element: <PostRequest />,
      },
      {
        path: '/postoffer',
        element: <PostOffer />,
      },
      {
        path: '/messages',
        element: <Messages />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)