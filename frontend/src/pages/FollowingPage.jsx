import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaUserFriends, FaTimes, FaArrowLeft, FaCheck, FaQuestion } from 'react-icons/fa';
import { GiHoneycomb, GiBee } from 'react-icons/gi';
import { getFollowing } from "../api/followApi";

export default function FollowingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [usersMap, setUsersMap] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsMounted(true);
    fetchAllUsers();
    fetchFollowing();
  }, [user]);

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

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await getFollowing(user.email);
      setFollowing(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch following list");
      console.error("Error fetching following:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleUnfollowClick = (receiverEmail) => {
    setUserToUnfollow(receiverEmail);
    setShowConfirmDialog(true);
  };

  const confirmUnfollow = async () => {
    try {
      await axios.post("/follow/unfollow", null, {
        params: { 
          senderEmail: user.email, 
          receiverEmail: userToUnfollow 
        }
      });
      showNotification('Unfollowed successfully', 'success');
      setShowConfirmDialog(false);
      setUserToUnfollow(null);
      // Refresh the page by reloading the data
      fetchFollowing();
    } catch (err) {
      console.error("Error unfollowing:", err);
      showNotification('Failed to unfollow', 'error');
      setShowConfirmDialog(false);
      setUserToUnfollow(null);
    }
  };

  const cancelUnfollow = () => {
    setShowConfirmDialog(false);
    setUserToUnfollow(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center text-gray-700">Please log in to view this page</div>
      </div>
    );
  }

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

      {showConfirmDialog && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <FaQuestion className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Unfollow</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to unfollow {usersMap[userToUnfollow] || userToUnfollow}?
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={cancelUnfollow}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnfollow}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes /> Unfollow
                </button>
              </div>
            </div>
          </motion.div>
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
              People You Follow
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
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <FaArrowLeft /> Back to Profile
          </button>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p>Loading people you follow...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchFollowing}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-10">
              <FaUserFriends className="text-5xl text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Not Following Anyone</h3>
              <p className="text-gray-500">You aren't following anyone yet.</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-center">
                  You are following {following.length} user{following.length !== 1 ? 's' : ''}
                </p>
              </div>

              <ul className="divide-y divide-gray-200">
                {following.map((follow) => (
                  <motion.li 
                    key={follow.id}
                    className="py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {usersMap[follow.receiverEmail] || follow.receiverEmail}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {follow.receiverEmail}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnfollowClick(follow.receiverEmail)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <FaTimes /> Unfollow
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}