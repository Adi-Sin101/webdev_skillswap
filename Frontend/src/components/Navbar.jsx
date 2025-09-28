import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaXmark } from "react-icons/fa6";
import { useEffect, useState } from 'react';
const navItems=[
    {path:"/",label:"Find Skills"},
    {path:"/postoffer",label:"Post Offer"},
    {path:"/postrequest",label:"Post Request"},
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
                                : 'text-gray-800 font-medium px-4 py-2 rounded-xl hover:bg-white/40 hover:text-gray-900 transition-all duration-200'}
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
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    
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
                <Link to="/" className="font-bold text-xl flex-shrink-0 text-gray-800 tracking-wide" style={{letterSpacing: '0.04em'}}>
                    SkillSwap
                </Link>
                {/* Mobile: hamburger menu on right */}
                <div className='md:hidden flex items-center gap-4'>
                    <div className="text-2xl cursor-pointer text-gray-700 hover:text-gray-900 bg-white/30 hover:bg-white/50 p-2 rounded-lg transition-all duration-200" onClick={toggleMenu}>
                        {isMenuOpen ? <FaXmark /> : <FaBars />}
                    </div>
                </div>
                {/*Desktop menu*/}
                <div className="hidden md:flex">
                    <NavItems closeMenu={closeMenu} isScrolled={isScrolled} />
                </div>
            </nav>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg border-t relative z-50 text-black">
                    <div className="px-4 py-4">
                        <NavItems isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
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