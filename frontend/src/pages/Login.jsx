import { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../auth/useAuth"; 
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GiHoneycomb, GiBee } from 'react-icons/gi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useState(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error states
    setEmailError(false);
    setPasswordError(false);

    try {
      const res = await axios.post("/auth/login", { email, password });

      if (!res.data.startsWith("Invalid")) {
        const token = res.data;
        await login(token); // ✅ Load user and store it in localStorage inside AuthContext

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setNotification({
          show: true,
          message: 'Login successful!',
          type: 'success'
        });

        setTimeout(() => {
          navigate("/feed");
        }, 1500);
      } else {
        setEmailError(true);
        setPasswordError(true);
        setNotification({
          show: true,
          message: 'Invalid email or password. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Login failed. Please try again.";
      
      setEmailError(true);
      setPasswordError(true);
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = "Invalid email or password.";
        }
      }
      
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/${provider}`;
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
              Welcome back!
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
              Sign In to Your Account
            </motion.h2>
            
            <div className="space-y-4 mb-6">
              <motion.button
                onClick={() => handleSocialLogin("google")}
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
                onClick={() => handleSocialLogin("github")}
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200`}
                  placeholder="your@email.com"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid email</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200 pr-12`}
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
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">Password is incorrect</p>
                )}
              </motion.div>

              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={isMounted ? { opacity: 1 } : {}}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                Sign In
              </motion.button>
            </form>

            <motion.div 
              className="mt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <p>
                New to our platform?{' '}
                <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500">
                  Create an account
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="mt-6 text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={isMounted ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p>© {new Date().getFullYear()} DesignHive. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}