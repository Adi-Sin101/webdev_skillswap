import { useState } from 'react'
import { FaBars } from 'react-icons/fa6';
import { Outlet, useLocation } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Only show sidebar on FindSkills page (root path)
  const showSidebar = location.pathname === '/';

  return (
    <>
      <Navbar />
      <div className={`flex bg-gray-50 min-h-[calc(100vh-64px)] transition-all duration-300 ${showSidebar && sidebarOpen ? 'gap-6 p-6' : 'p-6'}`}>
        <main className={`transition-all duration-300 ${showSidebar && sidebarOpen ? 'flex-1' : 'w-full'}`}>
          <Outlet />
        </main>
        {/* Sidebar and toggle button - only show on FindSkills page */}
        {showSidebar && (
          <div className="relative">
            {/* Hamburger button - square, sticky below navbar, always near sidebar */}
            <button
              className="absolute -left-12 z-50 bg-white border border-gray-300 p-3 rounded-lg shadow-lg hover:bg-gray-100 transition flex items-center justify-center"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              style={{ top: '104px' }} // 104px below top for spacing from navbar (navbar is 64px + 40px margin)
            >
              <FaBars size={24} className="text-gray-700" />
            </button>
            {sidebarOpen && (
              <aside className="w-72 sticky top-[104px] self-start animate-slide-in-right">
                <Sidebar />
              </aside>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App
