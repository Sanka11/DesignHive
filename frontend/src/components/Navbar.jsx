import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaBars, FaTimes, FaSearch, FaThumbsUp, FaSignOutAlt, FaUser, FaQuestionCircle } from "react-icons/fa";
import { RiDashboardLine } from "react-icons/ri";
import { GiBee } from "react-icons/gi";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import DesignHiveLogo from "../assets/DesignHiveLogo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/user', {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:9090/api/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      localStorage.removeItem('rememberedEmail');
      navigate('/login?logout_success=true', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return null;

  const profilePic = user?.picture || user?.avatar_url;
  const firstName = user?.name?.split(' ')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <nav className={`bg-amber-50 text-gray-900 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "shadow-lg py-1" : "shadow-md py-2"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Search */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center">
              <img src={DesignHiveLogo} alt="DesignHive" className="h-10 w-auto" />
            </Link>
            <button onClick={toggleSearch} className="md:hidden p-2 rounded-full hover:bg-amber-100 transition" aria-label="Search">
              <FaSearch className="text-amber-800" />
            </button>
          </div>

          {/* Desktop Search */}
          <div className={`hidden md:flex items-center mx-4 flex-1 max-w-2xl ${searchOpen ? "md:hidden" : ""}`}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search designs, skills, or users..."
                className="w-full py-2 px-4 pl-10 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50 placeholder-amber-800/70"
              />
              <FaSearch className="absolute left-3 top-3 text-amber-600" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/dashboard" icon={<RiDashboardLine />}>Feed</NavLink>
            <NavLink to="/recommended" icon={<FaThumbsUp />}>Recommended</NavLink>
            <NavLink to="/share">New Post</NavLink>
            <NavLink to="/learning">Learning Plans</NavLink>

            <button className="p-2 relative rounded-full hover:bg-amber-100 transition">
              <FaBell className="text-amber-800 text-xl" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={toggleProfile} className="flex items-center space-x-2 p-1 rounded-full hover:bg-amber-100 transition" aria-label="Profile menu">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-amber-300" referrerPolicy="no-referrer" />
                ) : (
                  <GiBee className="text-amber-800 text-2xl" />
                )}
                <span className="text-sm font-medium hidden lg:inline">{firstName}</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-amber-50 border border-amber-200 rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-amber-100 bg-amber-100">
                      <div className="flex items-center space-x-3">
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <GiBee className="text-amber-800 text-2xl" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-amber-800/70 break-all">{userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <DropdownLink to="/profile" icon={<FaUser className="text-amber-700" />}>My Profile</DropdownLink>
                    <DropdownLink to="/help" icon={<FaQuestionCircle className="text-amber-700" />}>Help Center</DropdownLink>
                    <div className="border-t border-amber-100">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-amber-100 transition flex items-center space-x-2 text-red-600">
                        <FaSignOutAlt className="text-amber-700" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label="Menu">
              {menuOpen ? <FaTimes className="text-xl text-amber-800" /> : <FaBars className="text-xl text-amber-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden my-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pl-10 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50 placeholder-amber-800/70"
              />
              <FaSearch className="absolute left-3 top-3 text-amber-600" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-amber-50 border-t border-amber-200 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              <div className="flex items-center space-x-3 px-4 py-3 border-b border-amber-100">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <GiBee className="text-amber-800 text-3xl" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-amber-800/70 break-all">{userEmail}</p>
                </div>
              </div>
              <MobileNavLink to="/dashboard" icon={<RiDashboardLine />}>Feed</MobileNavLink>
              <MobileNavLink to="/recommended" icon={<FaThumbsUp />}>Recommended</MobileNavLink>
              <MobileNavLink to="/share">New Post</MobileNavLink>
              <MobileNavLink to="/learning">Learning Plans</MobileNavLink>
              <div className="pt-2 border-t border-amber-200">
                <MobileNavLink to="/profile" icon={<FaUser />}>Profile</MobileNavLink>
                <MobileNavLink to="/help" icon={<FaQuestionCircle />}>Help Center</MobileNavLink>
                <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-red-500 hover:bg-red-50 rounded-lg transition flex items-center space-x-3">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Reusable Components
const NavLink = ({ to, children, icon }) => (
  <Link to={to} className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-amber-100 hover:text-amber-900 transition font-medium text-amber-800">
    {icon && <span className="text-lg">{icon}</span>}
    <span>{children}</span>
  </Link>
);

const MobileNavLink = ({ to, children, icon }) => (
  <Link to={to} className="flex items-center space-x-3 py-3 px-4 hover:bg-amber-100 rounded-lg transition font-medium text-amber-800">
    {icon && <span className="text-xl text-amber-700">{icon}</span>}
    <span>{children}</span>
  </Link>
);

const DropdownLink = ({ to, children, icon }) => (
  <Link to={to} className="block px-4 py-3 hover:bg-amber-100 transition flex items-center space-x-2 text-amber-800">
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;