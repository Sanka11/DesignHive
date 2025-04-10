import { useEffect, useState } from "react";
import axios from "../api/axios";
import { sendFollowRequest } from "../api/followApi";
import {
  FiUserPlus,
  FiUserCheck,
  FiX,
  FiMessageSquare,
  FiGlobe,
  FiCalendar,
  FiUser,
  FiHeart,
  FiAward,
  FiBriefcase
} from "react-icons/fi";
import defaultProfilePic from "../assets/default-profile.png";
import {
  FaBirthdayCake,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaUserPlus,
  FaUserCheck,
  FaHashtag,
  FaRegStar,
  FaStar,
  FaLink
} from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GiBee, GiHoneycomb } from 'react-icons/gi';

export default function UserList({ user }) {
  const [allUsers, setAllUsers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
        duration: 0.6
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const getProfilePic = (userData) => {
    if (userData?.profileImagePath) {
      return userData.profileImagePath; // Using Firebase URL directly
    }
    return defaultProfilePic;
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const startChatWithUser = async (otherUserEmail) => {
    try {
      const emails = [user.email, otherUserEmail].sort();
      const chatId = `${emails[0]}_${emails[1]}`;

      await axios.post("/chats/start", {
        user1: user.email,
        user2: otherUserEmail,
        chatId: chatId
      });

      navigate(`/chat/${chatId}`);
      closeModal();
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  useEffect(() => {
    const fetchUsersAndStatuses = async () => {
      try {
        setIsLoading(true);
        const usersRes = await axios.get("/user/all");
        const filtered = usersRes.data.filter((u) => u.email !== user.email);
        setAllUsers(filtered);

        const statusRes = await axios.get("/follow/statuses", {
          params: { senderEmail: user.email },
        });
        setStatuses(statusRes.data);
      } catch (error) {
        console.error("Error fetching users or statuses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersAndStatuses();
  }, [user.email]);

  const handleFollow = async (receiverEmail) => {
    try {
      await sendFollowRequest(user.email, receiverEmail);
      const res = await axios.get("/follow/statuses", {
        params: { senderEmail: user.email },
      });
      setStatuses(res.data);
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (receiverEmail) => {
    try {
      await axios.post("/follow/unfollow", null, {
        params: { senderEmail: user.email, receiverEmail },
      });
      const res = await axios.get("/follow/statuses", {
        params: { senderEmail: user.email },
      });
      setStatuses(res.data);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setIsFollowing(statuses[user.email] === "accepted");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const followingUsers = filteredUsers.filter(u => statuses[u.email] === "accepted");
  const otherUsers = filteredUsers.filter(u => statuses[u.email] !== "accepted");
  const displayedSuggestions = showAllSuggestions ? otherUsers : otherUsers.slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="md:w-[30%] relative">
      {/* Animated User Profile Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
            >
              {/* Modal Header with Gradient Background */}
              <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 text-white relative">
                <div className="flex justify-between items-center">
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-amber-600 transition-colors"
                    aria-label="Close profile"
                  >
                    <FiX size={24} className="text-white" />
                  </button>
                  <div className="flex gap-3">
                    {statuses[selectedUser.email] === "accepted" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfollow(selectedUser.email);
                        }}
                        className="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-full transition-colors shadow-sm"
                      >
                        <FaUserCheck /> Following
                      </button>
                    ) : statuses[selectedUser.email] === "pending" ? (
                      <button
                        disabled
                        className="flex items-center gap-2 bg-white bg-opacity-80 text-amber-700 px-4 py-2 rounded-full shadow-sm"
                      >
                        <FaUserCheck /> Requested
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(selectedUser.email);
                        }}
                        className="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-full transition-colors shadow-sm"
                      >
                        <FaUserPlus /> Follow
                      </button>
                    )}
                    <button
                      onClick={() => startChatWithUser(selectedUser.email)}
                      className="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-full transition-colors shadow-sm"
                    >
                      <FiMessageSquare /> Message
                    </button>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <GiHoneycomb className="text-amber-200 text-xl opacity-60" />
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column - Avatar & Basic Info */}
                  <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 mb-6 overflow-hidden border-4 border-white shadow-xl">
                      <img
                        src={getProfilePic(selectedUser)}
                        alt={selectedUser.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProfilePic;
                        }}
                      />
                      {selectedUser.isOnline && (
                        <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="text-center md:text-left w-full">
                      <h1 className="text-3xl font-bold text-gray-800">{selectedUser.username}</h1>
                      {selectedUser.title && (
                        <p className="text-amber-600 font-medium mt-1">{selectedUser.title}</p>
                      )}

                      {selectedUser.bio && (
                        <p className="text-gray-600 mt-4 text-center md:text-left">
                          {selectedUser.bio}
                        </p>
                      )}

                      {/* Social Links */}
                      {selectedUser.website && (
                        <div className="mt-4 flex items-center justify-center md:justify-start">
                          <a
                            href={selectedUser.website.startsWith('http') ? selectedUser.website : `https://${selectedUser.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-800 flex items-center"
                          >
                            <FaLink className="mr-2" />
                            {selectedUser.website.replace(/(^\w+:|^)\/\//, '')}
                          </a>
                        </div>
                      )}

                      {/* Skills/Tags */}
                      <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                        {selectedUser.skills?.slice(0, 6).map((skill, index) => (
                          <motion.span
                            key={index}
                            className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                            whileHover={{ scale: 1.05 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detailed Info */}
                  <div className="flex-1 space-y-6">
                    {/* Personal Info Section */}
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                      <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
                        <FiUser className="mr-2" />
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUser.fullName && (
                          <div className="flex items-start">
                            <span className="font-medium text-gray-600 mr-2 min-w-[100px]">Full Name:</span>
                            <span className="text-gray-800">{selectedUser.fullName}</span>
                          </div>
                        )}

                        <div className="flex items-start">
                          <IoMdMail className="text-amber-500 mr-2 mt-1" />
                          <div>
                            <span className="block text-gray-600">Email</span>
                            <span className="text-gray-800">{selectedUser.email}</span>
                          </div>
                        </div>

                        {selectedUser.birthday && (
                          <div className="flex items-start">
                            <FaBirthdayCake className="text-amber-500 mr-2 mt-1" />
                            <div>
                              <span className="block text-gray-600">Birthday</span>
                              <span className="text-gray-800">
                                {formatDate(selectedUser.birthday)}
                                <span className="text-gray-500 ml-2">
                                  ({calculateAge(selectedUser.birthday)} years)
                                </span>
                              </span>
                            </div>
                          </div>
                        )}

                        {selectedUser.gender && (
                          <div className="flex items-start">
                            <FaVenusMars className="text-amber-500 mr-2 mt-1" />
                            <div>
                              <span className="block text-gray-600">Gender</span>
                              <span className="text-gray-800">{selectedUser.gender}</span>
                            </div>
                          </div>
                        )}

                        {selectedUser.location && (
                          <div className="flex items-start">
                            <FaMapMarkerAlt className="text-amber-500 mr-2 mt-1" />
                            <div>
                              <span className="block text-gray-600">Location</span>
                              <span className="text-gray-800">{selectedUser.location}</span>
                            </div>
                          </div>
                        )}

                        {selectedUser.contactNo && (
                          <div className="flex items-start">
                            <FaPhone className="text-amber-500 mr-2 mt-1" />
                            <div>
                              <span className="block text-gray-600">Phone</span>
                              <span className="text-gray-800">{selectedUser.contactNo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* About Section */}
                    {selectedUser.about && (
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
                          <FiGlobe className="mr-2" />
                          About
                        </h2>
                        <p className="text-gray-700 whitespace-pre-line">{selectedUser.about}</p>
                      </div>
                    )}

                    {/* Interests Section */}
                    {selectedUser.interests && (
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
                          <FiHeart className="mr-2" />
                          Interests
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {selectedUser.interests.split(',').map((interest, index) => (
                            <motion.span
                              key={index}
                              className="bg-white text-amber-700 px-4 py-2 rounded-full text-sm shadow-sm flex items-center"
                              whileHover={{ scale: 1.05 }}
                            >
                              <GiBee className="mr-2" /> {interest.trim()}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience/Education Section */}
                    {selectedUser.experience && selectedUser.experience.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
                          <FiBriefcase className="mr-2" />
                          Experience
                        </h2>
                        <div className="space-y-4">
                          {selectedUser.experience.map((exp, index) => (
                            <div key={index} className="border-l-4 border-amber-400 pl-4 py-1">
                              <h3 className="font-bold text-gray-800">{exp.role}</h3>
                              <p className="text-gray-600">{exp.company}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                              </p>
                              {exp.description && (
                                <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferences Section */}
                    {selectedUser.preferences?.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
                          <FaRegStar className="mr-2" />
                          Preferences
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.preferences.map((pref, index) => (
                            <motion.span
                              key={index}
                              className="bg-white text-amber-700 px-3 py-1 rounded-full text-sm shadow-sm flex items-center"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FaStar className="mr-1 text-amber-400" /> {pref}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User List Sidebar */}
      <div className="sticky top-8 space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search people..."
              className="w-full pl-10 pr-4 py-3 bg-amber-50 rounded-lg border-none focus:ring-2 focus:ring-amber-200 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5 text-amber-500">
              <GiBee />
            </div>
          </div>
        </div>

        {/* Following Section */}
        {followingUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FiUserCheck className="mr-2 text-amber-500" />
              Following ({followingUsers.length})
            </h3>
            <ul className="space-y-3">
              {followingUsers.slice(0, 5).map((u) => (
                <motion.li
                  key={u.email}
                  className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleUserClick(u)}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 mr-3 overflow-hidden border-2 border-white shadow">
                      <img
                        src={getProfilePic(u)}
                        alt={u.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProfilePic;
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium block">{u.username}</span>
                      <span className="text-xs text-amber-600">Following</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startChatWithUser(u.email);
                      }}
                      className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full hover:bg-amber-700 flex items-center transition-colors"
                    >
                      <FiMessageSquare size={12} className="mr-1" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
            {followingUsers.length > 5 && (
              <button
                className="text-xs text-amber-600 mt-2 hover:underline"
                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              >
                See all {followingUsers.length} following
              </button>
            )}
          </div>
        )}

        {/* Suggestions Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FiUserPlus className="mr-2 text-amber-500" />
            Suggestions for you
          </h3>
          <ul className="space-y-3">
            {displayedSuggestions.map((u) => {
              const status = statuses[u.email] || "none";
              return (
                <motion.li
                  key={u.email}
                  className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleUserClick(u)}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 mr-3 overflow-hidden border-2 border-white shadow">
                      <img
                        src={getProfilePic(u)}
                        alt={u.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProfilePic;
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium block">{u.username}</span>
                      <span className="text-xs text-amber-600">New to DesignHive</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startChatWithUser(u.email);
                      }}
                      className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full hover:bg-amber-700 flex items-center transition-colors"
                    >
                      <FiMessageSquare size={12} className="mr-1" />
                    </button>
                    {status === "none" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(u.email);
                        }}
                        className="text-xs bg-white border border-amber-600 text-amber-600 px-3 py-1 rounded-full hover:bg-amber-50 transition-colors"
                      >
                        Follow
                      </button>
                    )}
                    {status === "pending" && (
                      <button
                        disabled
                        className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full"
                      >
                        Requested
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
          {otherUsers.length > 5 && (
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="text-xs text-amber-600 mt-2 hover:underline"
            >
              {showAllSuggestions ? "Show less" : `Show more (${otherUsers.length - 5})`}
            </button>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-2">
            <a href="#" className="hover:underline hover:text-amber-600">About</a>
            <a href="#" className="hover:underline hover:text-amber-600">Help</a>
            <a href="#" className="hover:underline hover:text-amber-600">Terms</a>
            <a href="#" className="hover:underline hover:text-amber-600">Privacy</a>
          </div>
          
        </div>
      </div>
    </div>
  );
}