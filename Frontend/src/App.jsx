import { Outlet } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <>
      <Navbar />
      <div className="flex bg-gray-50 min-h-[calc(100vh-64px)] p-6">
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App
