import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaBars, FaTimes, FaThumbsUp, FaSignOutAlt, FaUser, FaQuestionCircle, FaUserFriends } from "react-icons/fa";
import { RiDashboardLine } from "react-icons/ri";
import { GiBee } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/useAuth";
import DesignHiveLogo from "../assets/DesignHiveLogo.png";
import defaultProfilePic from "../assets/default-profile.png"; 
import { MdAdd } from "react-icons/md";
import axios from "../api/axios";
import { FaCheck, FaTimes as FaTimesIcon } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [cancelingRequest, setCancelingRequest] = useState(null);
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  if (hideNavbar) return null;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login?logout_success=true', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const closeMobileMenu = () => setMenuOpen(false);

  // Fetch all users for username mapping
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("/user/all");
      const users = response.data.reduce((map, user) => {
        map[user.email] = user.username;
        return map;
      }, {});
      setUsersMap(users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Get pending follow requests
  const getPendingRequests = async (email) => {
    try {
      const response = await axios.get("/follow/pending", {
        params: { receiverEmail: email }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  // Accept follow request
  const handleAccept = async (id) => {
    try {
      setAcceptingRequest(id);
      await axios.post("/follow/accept", null, {
        params: { requestId: id }
      });
      // Remove the accepted request from the state
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setAcceptingRequest(null);
    }
  };

  // Cancel follow request
  const handleCancelRequest = async (senderEmail) => {
    try {
      setCancelingRequest(senderEmail);
      await axios.post("/follow/cancel", null, {
        params: { 
          senderEmail, 
          receiverEmail: user.email 
        }
      });
      // Remove the canceled request from the state
      setPendingRequests(prev => prev.filter(req => req.senderEmail !== senderEmail));
    } catch (err) {
      console.error("Error canceling request:", err);
    } finally {
      setCancelingRequest(null);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchAllUsers();
      getPendingRequests(user.email);
    }
  }, [user]);

  if (!user) return null;

  const profilePic = user.profileImagePath
    ? user.profileImagePath.startsWith("http")
      ? user.profileImagePath
      : `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${user.profileImagePath}`
    : defaultProfilePic;

  const firstName = user.username?.split(' ')[0] || 'User';
  const userEmail = user.email || '';

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = "/default-profile.png";
  };

  // Check active route
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`bg-amber-50 text-gray-900 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "shadow-lg py-1" : "shadow-md py-2"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/feed" className="flex items-center">
              <img src={DesignHiveLogo} alt="DesignHive" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Empty div to maintain space where search was */}
          <div className="hidden md:flex items-center mx-4 flex-1 max-w-2xl"></div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/feed" icon={<RiDashboardLine />} isActive={isActive("/feed")}>Feed</NavLink>
            <NavLink to="/recommended" icon={<FaThumbsUp />} isActive={isActive("/recommended")}>Recommended</NavLink>
            <NavLink to="/explore-plans" isActive={isActive("/explore-plans")}>Explore Plans</NavLink>
            <NavLink to="/learning-planhome" isActive={isActive("/learning-planhome")}>Create Plans</NavLink>     
            <NavLink to="/manageposts" isActive={isActive("/manageposts")}>Manage Posts</NavLink>

            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={toggleNotifications} 
                className="p-2 relative rounded-full hover:bg-amber-100 transition"
                aria-label="Notifications"
              >
                <FaBell className="text-amber-800 text-xl" />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-amber-50 border border-amber-200 rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-amber-100 bg-amber-100 flex justify-between items-center">
                      <h3 className="font-medium flex items-center gap-2">
                        <FaUserFriends /> Follow Requests
                      </h3>
                      <span className="text-sm text-amber-800">
                        {pendingRequests.length} pending
                      </span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {pendingRequests.length > 0 ? (
                        <ul className="divide-y divide-amber-100">
                          {pendingRequests.map((req) => (
                            <motion.li 
                              key={req.id} 
                              className="py-3 px-4 hover:bg-amber-50 transition"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <GiBee className="text-amber-600 text-xl" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {usersMap[req.senderEmail] || req.senderEmail}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                      {req.senderEmail}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAccept(req.id);
                                    }}
                                    disabled={acceptingRequest === req.id}
                                    className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs flex items-center justify-center h-6 w-6"
                                    title="Accept"
                                  >
                                    {acceptingRequest === req.id ? (
                                      <GiBee className="animate-spin" />
                                    ) : (
                                      <FaCheck />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelRequest(req.senderEmail);
                                    }}
                                    disabled={cancelingRequest === req.senderEmail}
                                    className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center h-6 w-6"
                                    title="Decline"
                                  >
                                    {cancelingRequest === req.senderEmail ? (
                                      <GiBee className="animate-spin" />
                                    ) : (
                                      <FaTimesIcon />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          <FaUserFriends className="mx-auto text-2xl text-amber-400 mb-2" />
                          <p>No pending requests</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-center">
                      <Link 
                        to="/profile" 
                        className="text-sm text-amber-600 hover:text-amber-800"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all in profile
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button onClick={toggleProfile} className="flex items-center space-x-2 p-1 rounded-full hover:bg-amber-100 transition" aria-label="Profile menu">
                {profilePic ? (
                  <img src={profilePic} onError={handleImgError} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-amber-300" referrerPolicy="no-referrer" />
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
                          <img src={profilePic} onError={handleImgError} alt="Profile" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <GiBee className="text-amber-800 text-2xl" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{user.username || 'User'}</p>
                          <p className="text-xs text-amber-800/70 break-all">{userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <DropdownLink to="/profile" icon={<FaUser className="text-amber-700" />}>My Profile</DropdownLink>
                    <DropdownLink to="/newpost" icon={<MdAdd className="text-amber-700" />}>New Post</DropdownLink>
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

          <div className="md:hidden flex items-center space-x-3">
            <button 
              onClick={toggleNotifications} 
              className="p-2 relative rounded-full hover:bg-amber-100 transition"
              aria-label="Notifications"
            >
              <FaBell className="text-amber-800 text-xl" />
              {pendingRequests.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            
            <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label="Menu">
              {menuOpen ? <FaTimes className="text-xl text-amber-800" /> : <FaBars className="text-xl text-amber-800" />}
            </button>
          </div>
        </div>
      </div>

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
                  <img src={profilePic} onError={handleImgError} alt="Profile" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <GiBee className="text-amber-800 text-3xl" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.username || 'User'}</p>
                  <p className="text-xs text-amber-800/70 break-all">{userEmail}</p>
                </div>
              </div>
              
              {pendingRequests.length > 0 && (
                <div className="bg-amber-100 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <FaUserFriends /> Follow Requests
                    </h3>
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                      {pendingRequests.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pendingRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <div className="flex items-center gap-2">
                          <GiBee className="text-amber-600" />
                          <span className="text-sm truncate max-w-[120px]">
                            {usersMap[req.senderEmail] || req.senderEmail.split('@')[0]}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAccept(req.id)}
                            disabled={acceptingRequest === req.id}
                            className="p-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                          >
                            {acceptingRequest === req.id ? '...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleCancelRequest(req.senderEmail)}
                            disabled={cancelingRequest === req.senderEmail}
                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                          >
                            {cancelingRequest === req.senderEmail ? '...' : 'Decline'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pendingRequests.length > 3 && (
                    <Link 
                      to="/profile" 
                      className="text-xs text-amber-700 mt-2 inline-block"
                      onClick={closeMobileMenu}
                    >
                      + {pendingRequests.length - 3} more requests
                    </Link>
                  )}
                </div>
              )}
              
              <MobileNavLink to="/feed" icon={<RiDashboardLine />} isActive={isActive("/feed")} onClick={closeMobileMenu}>Feed</MobileNavLink>
              <MobileNavLink to="/recommended" icon={<FaThumbsUp />} isActive={isActive("/recommended")} onClick={closeMobileMenu}>Recommended</MobileNavLink>
              <MobileNavLink to="/manageposts" isActive={isActive("/manageposts")} onClick={closeMobileMenu}>Manage Posts</MobileNavLink>
              <MobileNavLink to="/explore-plans" isActive={isActive("/explore-plans")} onClick={closeMobileMenu}>Explore Plans</MobileNavLink>
              <MobileNavLink to="/learning-planhome" isActive={isActive("/learning-planhome")} onClick={closeMobileMenu}>Create Plans</MobileNavLink>
              <div className="pt-2 border-t border-amber-200">
                <MobileNavLink to="/profile" icon={<FaUser />} isActive={isActive("/profile")} onClick={closeMobileMenu}>Profile</MobileNavLink>
                <MobileNavLink to="/help" icon={<FaQuestionCircle />} isActive={isActive("/help")} onClick={closeMobileMenu}>Help Center</MobileNavLink>
                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full text-left py-3 px-4 text-red-500 hover:bg-red-50 rounded-lg transition flex items-center space-x-3">
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

const NavLink = ({ to, children, icon, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition font-medium ${
      isActive 
        ? "bg-amber-200 text-amber-900" 
        : "text-amber-800 hover:bg-amber-100 hover:text-amber-900"
    }`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span>{children}</span>
  </Link>
);

const MobileNavLink = ({ to, children, icon, isActive, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition font-medium ${
      isActive 
        ? "bg-amber-200 text-amber-900" 
        : "text-amber-800 hover:bg-amber-100"
    }`}
  >
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