import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth"; 
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GiHoneycomb, GiBee } from 'react-icons/gi';

export default function Register() {
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });
  const navigate = useNavigate();

  useState(() => {
    setIsMounted(true);
  }, []);

  const handleSocialRegister = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/oauth2/authorization/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profileImage") {
        if (value) data.append(key, value);
      } else {
        data.append(key, value);
      }
    });

    try {
      const res = await axios.post("/auth/register", data);

      if (!res.data.startsWith("Email")) {
        setNotification({
          show: true,
          message: '✅ Registration successful!',
          type: 'success'
        });

        // ✅ Automatically login the user using the returned JWT
        await login(res.data);

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setNotification({
          show: true,
          message: '⚠️ ' + res.data,
          type: 'error'
        });
      }
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        message: '❌ Registration failed. Please try again later.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
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
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={isMounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 text-center relative"
            initial={{ opacity: 0 }}
            animate={isMounted ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={isMounted ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <GiBee className="text-3xl text-white" />
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold text-white"
                initial={{ x: 10, opacity: 0 }}
                animate={isMounted ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                DesignHive
              </motion.h1>
            </div>
            <motion.p 
              className="text-amber-100"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Join our creative community
            </motion.p>
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
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Create Your Account
            </motion.h2>
            
            <div className="space-y-4 mb-6">
              <motion.button
                onClick={() => handleSocialRegister("google")}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <FcGoogle className="text-xl" />
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </motion.button>

              <motion.button
                onClick={() => handleSocialRegister("github")}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <FaGithub className="text-xl text-gray-800" />
                <span className="text-gray-700 font-medium">
                  Continue with GitHub
                </span>
              </motion.button>
            </div>

            <motion.div 
              className="flex items-center mb-6"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200"
                  placeholder="yourusername"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image (optional)
                </label>
                <div className="relative">
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files[0] })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                Create Account
              </motion.button>
            </form>

            <motion.div 
              className="mt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="mt-6 text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={isMounted ? { opacity: 1 } : {}}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <p>© {new Date().getFullYear()} DesignHive. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}