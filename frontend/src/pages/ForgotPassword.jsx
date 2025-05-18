import { useState, useEffect } from "react";
import axios from "../api/axios";
import { motion } from 'framer-motion';
import { GiHoneycomb, GiBee } from 'react-icons/gi';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { MdPassword, MdEmail } from 'react-icons/md';
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 5) return 'Password must be at least 5 characters';
    if (password.length > 8) return 'Password cannot exceed 8 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      showNotification(passwordError, 'error');
      return;
    }

    if (!form.email || !form.username) {
      showNotification('Email and username are required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.put("/auth/reset-password", null, {
        params: {
          email: form.email,
          username: form.username,
          newPassword: form.newPassword,
        },
      });

      showNotification(res.data || 'Password reset successfully!', 'success');
      setForm({ email: "", username: "", newPassword: "" });
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data || "Something went wrong. Please try again.";
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
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
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
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
              Reset Password
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                <MdEmail /> Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="your@email.com"
                />
                <MdEmail className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="yourusername"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                <MdPassword /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                  placeholder="Enter new password (5-8 characters)"
                />
                <MdPassword className="absolute left-3 top-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">5-8 characters (digits only OK)</p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row justify-between gap-4 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={isMounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FaArrowLeft /> Back
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}