import { useAuth } from "../auth/useAuth";
import { useState, useEffect } from "react";
import axios from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { GiHoneycomb, GiBee } from 'react-icons/gi';
import { FaEye, FaEyeSlash, FaTimes, FaCheck, FaUserFriends, FaUserEdit, FaTrash, FaBirthdayCake, FaPhone, FaMapMarkerAlt, FaVenusMars, FaArrowLeft } from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { MdPassword } from 'react-icons/md';
import {
  getPendingRequests,
  acceptFollowRequest,
  getFollowers,
  getFollowing,
} from "../api/followApi";

const PREFERENCES_OPTIONS = {
  designDisciplines: [
    "UI Design",
    "UX Design",
    "Interaction Design",
    "Motion Design"
  ],
  designProcess: [
    "Wireframing",
    "Prototyping",
    "Visual Design",
    "UI Design Techniques"
  ],
  tools: [
    "Figma",
    "Adobe XD",
    "Sketch",
    "Blender",
    "After Effects"
  ],
  learningGoals: [
    "Career Development",
    "Improving UI/UX skills",
    "Mastering Tools",
    "Building Case Studies"
  ],
  skillLevel: [
    "Beginner",
    "Intermediate",
    "Advanced"
  ]
};

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...user });
  const [birthdayDate, setBirthdayDate] = useState(null);

  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(user.profileImagePath);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isPendingRequestsModalOpen, setPendingRequestsModalOpen] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleteSectionOpen, setDeleteSectionOpen] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState({
    designDisciplines: [],
    designProcess: [],
    tools: [],
    learningGoals: [],
    skillLevel: []
  });
  const [usersMap, setUsersMap] = useState({});
  const [cancelingRequest, setCancelingRequest] = useState(null);
  const [acceptingRequest, setAcceptingRequest] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    fetchAllUsers();
    loadFollowData();
    
    if (user.birthday) {
      const date = new Date(user.birthday);
      if (!isNaN(date.getTime())) {
        setBirthdayDate(date);
      }
    }
    
    if (user.preferences) {
      const initialPrefs = {
        designDisciplines: [],
        designProcess: [],
        tools: [],
        learningGoals: [],
        skillLevel: []
      };
      
      user.preferences.forEach(pref => {
        for (const category in PREFERENCES_OPTIONS) {
          if (PREFERENCES_OPTIONS[category].includes(pref)) {
            initialPrefs[category].push(pref);
            break;
          }
        }
      });
      
      setSelectedPreferences(initialPrefs);
    }
  }, []);

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

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const loadFollowData = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        getPendingRequests(user.email),
        getFollowers(user.email),
        getFollowing(user.email)
      ]);

      const followersWithUsernames = res2.data.map(f => ({
        ...f,
        senderUsername: usersMap[f.senderEmail] || f.senderEmail,
      }));

      const followingWithUsernames = res3.data.map(f => ({
        ...f,
        receiverUsername: usersMap[f.receiverEmail] || f.receiverEmail,
      }));

      setPendingRequests(res1.data);
      setFollowers(followersWithUsernames);
      setFollowing(followingWithUsernames);
    } catch (error) {
      showNotification('Failed to load follow data', 'error');
    }
  };

  const handleAccept = async (id) => {
    try {
      setAcceptingRequest(id);
      await acceptFollowRequest(id);
      showNotification('Follow request accepted', 'success');
      // Remove the accepted request from the state
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      showNotification('Failed to accept request', 'error');
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleCancelRequest = async (senderEmail) => {
    try {
      setCancelingRequest(senderEmail);
      await axios.post("/follow/cancel", null, {
        params: { 
          senderEmail, 
          receiverEmail: user.email 
        }
      });
      showNotification('Follow request canceled successfully', 'success');
      // Remove the canceled request from the state
      setPendingRequests(prev => prev.filter(req => req.senderEmail !== senderEmail));
    } catch (err) {
      console.error("Error canceling request:", err);
      showNotification('Failed to cancel follow request', 'error');
    } finally {
      setCancelingRequest(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center text-gray-700">Loading profile...</div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contactNo') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePreferencesChange = (category, value) => {
    setSelectedPreferences(prev => {
      const newSelected = { ...prev };
      if (newSelected[category].includes(value)) {
        newSelected[category] = newSelected[category].filter(item => item !== value);
      } else {
        newSelected[category] = [...newSelected[category], value];
      }
      
      const allPreferences = [];
      for (const cat in newSelected) {
        allPreferences.push(...newSelected[cat]);
      }
      
      setFormData(prevFormData => ({
        ...prevFormData,
        preferences: allPreferences
      }));
      
      return newSelected;
    });
  };

  const handleDateChange = (date) => {
    if (date && date > new Date()) {
      showNotification('Birthday cannot be in the future', 'error');
      return;
    }
    setBirthdayDate(date);
    setFormData(prev => ({
      ...prev,
      age: date ? calculateAge(date) : 0
    }));
  };

  const validateContactNo = (number) => {
    return number.length === 10;
  };

  const handleSubmit = async () => {
    if (formData.contactNo && !validateContactNo(formData.contactNo)) {
      showNotification('Please enter a valid 10-digit contact number', 'error');
      return;
    }

    try {
      const data = new FormData();
      const { password, ...rest } = formData;

      Object.entries(rest).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => data.append(`${key}`, v));
        } else if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      if (birthdayDate) {
        const formatted = birthdayDate.toISOString().split("T")[0];
        data.set("birthday", formatted);
      } else {
        data.set("birthday", "");
      }

      if (newImage) data.append("profileImage", newImage);

      await axios.put("/user/update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      showNotification('Profile updated successfully!', 'success');
      await login(localStorage.getItem("token"));
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (confirmed) {
      try {
        await axios.delete(`/user/delete?email=${user.email}`);
        showNotification('Account deleted successfully', 'success');
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
      } catch (error) {
        showNotification('Failed to delete account', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-10 px-4">
      {notification.show && (
        <motion.div 
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-lg"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={isMounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 text-center relative"
          initial={{ opacity: 0 }}
          animate={isMounted ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={isMounted ? { scale: 1 } : {}}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <GiBee className="text-4xl text-white" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {user.username}'s Profile
            </motion.h1>
          </div>
          <motion.div 
            className="absolute top-4 right-4"
            initial={{ scale: 0 }}
            animate={isMounted ? { scale: 1 } : {}}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            <GiHoneycomb className="text-amber-200 text-xl opacity-60" />
          </motion.div>
        </motion.div>

        <div className="p-8">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={isMounted ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {pendingRequests.length > 0 && (
              <motion.div 
                className="mb-6 bg-amber-50 rounded-xl p-4 border border-amber-200 cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.4 }}
                onClick={() => setPendingRequestsModalOpen(true)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-amber-800 flex items-center">
                    <FaUserFriends className="mr-2" />
                    You have {pendingRequests.length} pending follow request{pendingRequests.length > 1 ? 's' : ''}
                  </h3>
                  <button className="text-amber-600 hover:text-amber-800">
                    View all
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="flex justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <button
                onClick={() => navigate('/followers')}
                className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FaUserFriends /> Followers ({followers.length})
              </button>
              <button
                onClick={() => navigate('/following')}
                className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FaUserFriends /> Following ({following.length})
              </button>
              <button
                onClick={() => navigate('/sent-requests')}
                className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg transition-colors"
              >
                <FaUserFriends /> Sent Requests
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="relative group">
              <img
                src={preview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <label className="cursor-pointer text-white">
                  <FaUserEdit className="text-2xl" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
            {user.bio && <p className="text-gray-600 text-center max-w-md">{user.bio}</p>}
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={isMounted ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-amber-700 border-b border-amber-200 pb-2 flex items-center gap-2">
                <FaUserEdit /> Basic Information
              </h3>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  />
                  <span className="absolute left-3 top-3.5 text-gray-400">
                    @
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-amber-700 border-b border-amber-200 pb-2 flex items-center gap-2">
                <FaUserFriends /> Personal Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaBirthdayCake /> Birthday
                  </label>
                  <DatePicker
                    selected={birthdayDate}
                    onChange={handleDateChange}
                    onChangeRaw={(e) => e.preventDefault()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                    placeholderText="Select your birthday"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    isClearable
                    openToDate={new Date(2000, 0, 1)}
                    showMonthDropdown
                    dropdownMode="select"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    value={birthdayDate ? calculateAge(birthdayDate) : ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaVenusMars /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Location
                </label>
                <input
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaPhone /> Contact No
                </label>
                <input
                  name="contactNo"
                  value={formData.contactNo || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="10 digits only"
                  maxLength="10"
                />
                {formData.contactNo && !validateContactNo(formData.contactNo) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold text-amber-700 border-b border-amber-200 pb-2">
                Interests & Preferences
              </h3>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Interests
                </label>
                <input
                  name="interests"
                  value={formData.interests || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="Your hobbies and interests"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Design Disciplines</h4>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.designDisciplines.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePreferencesChange('designDisciplines', option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedPreferences.designDisciplines.includes(option)
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Design Process</h4>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.designProcess.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePreferencesChange('designProcess', option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedPreferences.designProcess.includes(option)
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.tools.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePreferencesChange('tools', option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedPreferences.tools.includes(option)
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.learningGoals.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePreferencesChange('learningGoals', option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedPreferences.learningGoals.includes(option)
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Level</h4>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.skillLevel.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePreferencesChange('skillLevel', option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedPreferences.skillLevel.includes(option)
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold text-amber-700 border-b border-amber-200 pb-2">
                Account Information
              </h3>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <IoMdMail /> Email
                </label>
                <div className="relative">
                  <input
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <IoMdMail className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MdPassword /> Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <MdPassword className="absolute left-3 top-3.5 text-gray-400" />
                </div>
                <Link 
                  to="/change-password" 
                  className="text-sm text-amber-600 hover:text-amber-800 mt-1 inline-block"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row justify-between gap-4 mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaCheck /> Save Changes
              </button>
              <button
                onClick={() => setDeleteSectionOpen(!isDeleteSectionOpen)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTrash /> {isDeleteSectionOpen ? 'Cancel' : 'Delete Account'}
              </button>
            </div>
            <Link 
              to="/feed" 
              className="bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Back to Home
            </Link>
          </motion.div>

          {isDeleteSectionOpen && (
            <motion.div 
              className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <FaTrash /> Delete Your Account
              </h3>
              <p className="text-red-700 mb-4">
                Warning: This action is irreversible. All your data will be permanently deleted.
              </p>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTrash /> Confirm Delete Account
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {isPendingRequestsModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUserFriends /> Pending Follow Requests
              </h3>
              <button
                onClick={() => setPendingRequestsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <ul className="divide-y divide-gray-200">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <motion.li 
                    key={req.id} 
                    className="py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{usersMap[req.senderEmail] || req.senderEmail}</p>
                        <p className="text-xs text-gray-500">{req.senderEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(req.id);
                          }}
                          disabled={acceptingRequest === req.id}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center min-w-[100px] justify-center"
                        >
                          {acceptingRequest === req.id ? (
                            <>
                              <motion.div
                                animate={{ 
                                  rotate: 360,
                                  y: [0, -5, 0]
                                }}
                                transition={{ 
                                  rotate: { 
                                    duration: 1, 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                  },
                                  y: {
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                  }
                                }}
                                className="mr-1"
                              >
                                <GiBee className="text-sm" />
                              </motion.div>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <FaCheck className="mr-1" /> Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRequest(req.senderEmail);
                          }}
                          disabled={cancelingRequest === req.senderEmail}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center min-w-[100px] justify-center"
                        >
                          {cancelingRequest === req.senderEmail ? (
                            <>
                              <motion.div
                                animate={{ 
                                  rotate: 360,
                                  y: [0, -5, 0]
                                }}
                                transition={{ 
                                  rotate: { 
                                    duration: 1, 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                  },
                                  y: {
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                  }
                                }}
                                className="mr-1"
                              >
                                <GiBee className="text-sm" />
                              </motion.div>
                              Canceling...
                            </>
                          ) : (
                            <>
                              <FaTimes className="mr-1" /> Cancel
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))
              ) : (
                <motion.div 
                  className="text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaUserFriends className="text-4xl text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending requests</p>
                </motion.div>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}