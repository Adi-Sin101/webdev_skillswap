import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'

function App() {
 
  return (
    <>
      <Navbar />
      {/* Flex container for main content + sidebar */}
      <div className="flex gap-6 p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
        {/* Main content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Right Sidebar (sticky) */}
        <aside className="w-72 sticky top-20 self-start">
          <Sidebar />
        </aside>
      </div>
    </>
  );
}

export default App
