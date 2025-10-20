import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaXmark, FaBell } from "react-icons/fa6";
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
const navItems=[
    {path:"/",label:"Find Skills"},
    {path:"/profile",label:"Profile"},
    {path:"/discover",label:"Discover Profiles"},
]

const NavItems = ({ isMenuOpen, closeMenu, isScrolled }) => {
    return(
        <ul className="flex flex-col md:flex-row items-center md:space-x-4 gap-6 md:gap-0">
            {navItems.map((item,index) => (
                <li key={index}>
                    <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            isActive
                                ? 'text-gray-900 bg-white/80 font-semibold px-4 py-2 rounded-xl shadow-sm transition-all duration-200'
                                : 'text-white font-medium px-4 py-2 rounded-xl hover:bg-white/40 hover:text-gray-900 transition-all duration-200'}
                    >
                        {item.label}
                    </NavLink>
                </li>
            ))}
        </ul>
    )
}


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Fetch unread notifications count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user && user._id) {
                try {
                    const response = await fetch(`http://localhost:5000/api/notifications/user/${user._id}/unread`);
                    const data = await response.json();
                    if (response.ok) {
                        setUnreadCount(data.unreadCount || 0);
                    }
                } catch (error) {
                    console.error('Error fetching unread count:', error);
                    setUnreadCount(0);
                }
            }
        };

        fetchUnreadCount();
        
        // Refresh unread count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);
    
    //when scroll, give background color to navbar
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 10;
            console.log('Scroll Y:', window.scrollY, 'Is Scrolled:', scrolled); // Debug log
            setIsScrolled(scrolled);
        };
        
        // Check initial scroll position
        handleScroll();
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return(
        <header 
            className="fixed top-4 left-4 right-4 z-50 transition-all duration-300 ease-in-out"
        >
            <nav
                className="max-w-screen-2xl mx-auto flex justify-between items-center py-4 px-6 md:px-12"
                style={{
                    background: 'linear-gradient(135deg, #29406b 80%, #3b5998 100%)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 4px 24px 0 rgba(60,80,120,0.10)',
                    border: '1px solid var(--color-gray-100)',
                    backdropFilter: 'blur(var(--blur-lg))',
                }}
            >
                {/*logo*/}
                <Link to="/" className="font-bold text-xl flex-shrink-0 text-white tracking-wide" style={{letterSpacing: '0.04em'}}>
                    SkillSwap
                </Link>
                {/* Mobile: hamburger menu on right */}
                <div className='md:hidden flex items-center gap-4'>
                    <div className="text-2xl cursor-pointer text-gray-700 hover:text-gray-900 bg-white/30 hover:bg-white/50 p-2 rounded-lg transition-all duration-200" onClick={toggleMenu}>
                        {isMenuOpen ? <FaXmark /> : <FaBars />}
                    </div>
                </div>
                {/*Desktop menu*/}
                <div className="hidden md:flex items-center gap-4">
                    <NavItems closeMenu={closeMenu} isScrolled={isScrolled} />
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* User Profile Section */}
                            <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl">
                                {/* User Avatar */}
                                <img 
                                    src={user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-white/50"
                                />
                                {/* User Info */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white">{user.name}</span>
                                    <span className="text-xs text-white/80">{user.university || "Student"}</span>
                                </div>
                            </div>
                            
                            {/* Notification Menu */}
                            <div className="relative notification-menu-container">
                                <Link
                                    to="/notifications"
                                    className="relative text-white font-medium p-2 rounded-xl hover:bg-white/40 hover:text-gray-900 transition-all duration-200 block"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A2.032 2.032 0 0116 12.414V11a6.01 6.01 0 00-2-4.473 6.003 6.003 0 00-8 0A6.01 6.01 0 004 11v1.414c0 .529-.211 1.036-.595 1.405L0 17h5m10 0v1a3 3 0 11-6 0v-1" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="text-white font-medium px-4 py-2 rounded-xl hover:bg-white/40 hover:text-gray-900 transition-all duration-200"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className="bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200 shadow"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg border-t relative z-50 text-black">
                    <div className="px-4 py-4">
                        <NavItems isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                            {user ? (
                                <>
                                    {/* Mobile User Profile Section */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                                        <img 
                                            src={user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-600">{user.university || "Student"}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Notifications */}
                                    <Link 
                                        to="/notifications" 
                                        onClick={closeMenu}
                                        className="bg-gray-50 rounded-xl p-3 mb-2 block hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A2.032 2.032 0 0116 12.414V11a6.01 6.01 0 00-2-4.473 6.003 6.003 0 00-8 0A6.01 6.01 0 004 11v1.414c0 .529-.211 1.036-.595 1.405L0 17h5m10 0v1a3 3 0 11-6 0v-1" />
                                                </svg>
                                                Notifications
                                            </h4>
                                            {unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'No new notifications'}
                                        </div>
                                        <div className="text-xs text-blue-600 font-medium mt-2">
                                            View all notifications →
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        onClick={closeMenu}
                                        className="text-gray-800 font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        onClick={closeMenu}
                                        className="bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200 shadow text-center"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Menu Overlay - Click to close */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 md:hidden z-40"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={closeMenu}
                ></div>
            )}
        </header>
    )
}
export default Navbar