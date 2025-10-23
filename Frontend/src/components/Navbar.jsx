import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaXmark, FaBell } from "react-icons/fa6";
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaRegEnvelope, FaRegBell } from "react-icons/fa6";
// Only include nav items up to Profile; User Info is handled separately at the end
const navItems = [
    { path: "/", label: "Find Skills" },
    { path: "/conversations", icon: <FaRegEnvelope className="inline-block text-lg align-middle" />, badge: "messages" },
    { path: "/notifications", icon: <FaRegBell className="inline-block text-lg align-middle" />, badge: "notifications" },
    { path: "/discover", label: "Discover Profiles" },
    { path: "/profile", label: "Profile" },
];

// Only render navItems; User Info is rendered separately after this component in the Navbar
const NavItems = ({ isMenuOpen, closeMenu, isScrolled, unreadMessageCount, unreadNotificationCount }) => {
    const { user } = useAuth();
    
    // Filter nav items for admin users - only show Profile 
    const filteredNavItems = user?.role === 'admin' 
        ? navItems.filter(item => item.path === '/profile')
        : navItems;
    
    return (
        <ul className="flex flex-col md:flex-row items-center md:space-x-4 gap-3 md:gap-0">
            {filteredNavItems.map((item, index) => {
                let badge = null;
                if (item.badge === "messages" && unreadMessageCount > 0) {
                    badge = (
                        <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                        </span>
                    );
                }
                if (item.badge === "notifications" && unreadNotificationCount > 0) {
                    badge = (
                        <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                    );
                }
                return (
                    <li key={index} className="w-full md:w-auto">
                        <NavLink
                            to={item.path}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-gray-900 md:text-gray-900 bg-blue-100 md:bg-white/80 font-semibold px-4 py-3 md:py-2 rounded-xl shadow-sm transition-all duration-200 block text-center'
                                    : 'text-gray-700 md:text-white font-medium px-4 py-3 md:py-2 rounded-xl hover:bg-gray-100 md:hover:bg-white/40 hover:text-gray-900 transition-all duration-200 block text-center'}
                        >
                            {item.icon ? <span className="inline-block align-middle">{item.icon}{badge}</span> : <>{item.label} {badge}</>}
                        </NavLink>
                    </li>
                );
            })}
        </ul>
    );
};


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const { user } = useAuth();
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Fetch unread notifications and messages count
    useEffect(() => {
        const fetchUnreadCounts = async () => {
            if (user && user._id) {
                try {
                    const [notificationsRes, messagesRes] = await Promise.all([
                        fetch(`http://localhost:5000/api/notifications/user/${user._id}/unread`),
                        fetch(`http://localhost:5000/api/messages/unread/${user._id}`)
                    ]);
                    
                    if (notificationsRes.ok) {
                        const notifData = await notificationsRes.json();
                        setUnreadNotificationCount(notifData.unreadCount || 0);
                    }
                    
                    if (messagesRes.ok) {
                        const msgData = await messagesRes.json();
                        setUnreadMessageCount(msgData.unreadCount || 0);
                    }
                } catch (error) {
                    console.error('Error fetching unread counts:', error);
                    setUnreadNotificationCount(0);
                    setUnreadMessageCount(0);
                }
            }
        };

        fetchUnreadCounts();
        
        // Refresh unread counts every 30 seconds
        const interval = setInterval(fetchUnreadCounts, 30000);
        return () => clearInterval(interval);
    }, [user]);
    
    //when scroll, give background color to navbar
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 10;
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
                {/* Logo */}
                <Link to="/" className="font-bold text-xl flex-shrink-0 text-white tracking-wide" style={{letterSpacing: '0.04em'}}>
                    SkillSwap
                </Link>
                
                {/* Mobile: hamburger menu on right */}
                <div className='md:hidden flex items-center gap-4'>
                    <div className="text-2xl cursor-pointer text-gray-700 hover:text-gray-900 bg-white/30 hover:bg-white/50 p-2 rounded-lg transition-all duration-200" onClick={toggleMenu}>
                        {isMenuOpen ? <FaXmark /> : <FaBars />}
                    </div>
                </div>
                
                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-4">
                    <NavItems 
                        closeMenu={closeMenu} 
                        isScrolled={isScrolled} 
                        unreadMessageCount={unreadMessageCount}
                        unreadNotificationCount={unreadNotificationCount}
                    />
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* User Profile Section */}
                            <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl">
                                {/* User Avatar */}
                                <img 
                                    src={user.profilePicture || user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-white/50"
                                />
                                {/* User Info */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white">{user.name}</span>
                                    <span className="text-xs text-white/80">{user.university || "Student"}</span>
                                </div>
                            </div>
                            {/* Admin Link */}
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="relative text-white font-medium px-4 py-2 rounded-xl bg-yellow-500/80 hover:bg-yellow-500 transition-all duration-200 flex items-center gap-2"
                                    title="Admin Panel"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-semibold">Admin</span>
                                </Link>
                            )}
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
                        {/* Mobile Navigation Links */}
                        <NavItems 
                            isMenuOpen={isMenuOpen} 
                            closeMenu={closeMenu} 
                            unreadMessageCount={unreadMessageCount}
                            unreadNotificationCount={unreadNotificationCount}
                        />
                        
                        {/* User Info and Admin Link for mobile */}
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                            {user && (
                                <>
                                    {/* Mobile User Profile Section */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                                        <img 
                                            src={user.profilePicture || user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-600">{user.university || "Student"}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    {/* Mobile Admin Link */}
                                    {user.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            onClick={closeMenu}
                                            className="bg-yellow-500 text-white rounded-xl p-3 mb-2 block hover:bg-yellow-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <h4 className="text-sm font-semibold">Admin Panel</h4>
                                            </div>
                                            <div className="text-xs mt-1 ml-7">Manage users, posts, and settings</div>
                                        </Link>
                                    )}
                                </>
                            )}
                            {!user && (
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