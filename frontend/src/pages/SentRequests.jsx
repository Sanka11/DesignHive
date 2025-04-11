import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaUserFriends, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { GiHoneycomb, GiBee } from 'react-icons/gi';

export default function SentRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    setIsMounted(true);
    fetchAllUsers();
    fetchPendingRequests();
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

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/follow/pending-sent", {
        params: { senderEmail: user.email }
      });
      setPendingRequests(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch pending requests");
      console.error("Error fetching pending requests:", err);
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

  const handleCancelRequest = async (receiverEmail) => {
    try {
      await axios.post("/follow/cancel", null, {
        params: { 
          senderEmail: user.email, 
          receiverEmail 
        }
      });
      showNotification('Follow request canceled successfully', 'success');
      // Refresh the list after cancellation
      fetchPendingRequests();
    } catch (err) {
      console.error("Error canceling request:", err);
      showNotification('Failed to cancel follow request', 'error');
    }
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
      {/* Notification */}
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
        {/* Header */}
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
              Your Sent Follow Requests
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
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <FaArrowLeft /> Back to Profile
          </button>

          {/* Content */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p>Loading your pending requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchPendingRequests}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-10">
              <FaUserFriends className="text-5xl text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
              <p className="text-gray-500">You haven't sent any follow requests that are still pending.</p>
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
                  You have {pendingRequests.length} pending follow request{pendingRequests.length !== 1 ? 's' : ''}
                </p>
              </div>

              <ul className="divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <motion.li 
                    key={request.id}
                    className="py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {usersMap[request.receiverEmail] || request.receiverEmail}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {request.receiverEmail}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(request.receiverEmail)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <FaTimes /> Cancel Request
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