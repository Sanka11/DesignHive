import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GiHoneycomb, GiBee } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleRegister = () => {
    setIsLoading(true);
    window.location.href = 'http://localhost:9090/oauth2/authorization/google';
  };

  const handleGithubRegister = () => {
    setIsLoading(true);
    window.location.href = 'http://localhost:9090/oauth2/authorization/github';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const checkResponse = await axios.get(
        `http://localhost:9090/api/user/check-email?email=${formData.email}`,
        { withCredentials: true }
      );

      if (checkResponse.data.exists) {
        setErrors({ form: 'An account with this email already exists' });
        return;
      }

      const registerResponse = await axios.post(
        'http://localhost:9090/api/auth/register',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        },
        { withCredentials: true }
      );
      
      if (registerResponse.status === 200) {
        const authResponse = await axios.post(
          'http://localhost:9090/api/auth/login',
          {
            email: formData.email,
            password: formData.password
          },
          { withCredentials: true }
        );
        
        if (authResponse.status === 200) {
          setNotification({
            show: true,
            message: 'Registration successful! Welcome to DesignHive!',
            type: 'success'
          });
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error'
      });
      if (error.response && error.response.data) {
        setErrors(prev => ({ 
          ...prev, 
          form: error.response.data.message || 'Registration failed. Please try again.' 
        }));
      } else {
        setErrors(prev => ({ ...prev, form: 'Registration failed. Please try again.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
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
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={isMounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Bee Icon */}
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

          {/* Registration Form */}
          <div className="p-8">
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Create Your Account
            </motion.h2>
            
            {errors.form && (
              <motion.div 
                className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.form}
              </motion.div>
            )}
            
            {/* OAuth Buttons */}
            <div className="space-y-4 mb-6">
              <motion.button
                onClick={handleGoogleRegister}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <FcGoogle className="text-xl" />
                <span className="text-gray-700 font-medium">
                  {isLoading ? 'Registering...' : 'Continue with Google'}
                </span>
              </motion.button>

              <motion.button
                onClick={handleGithubRegister}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <FaGithub className="text-xl text-gray-800" />
                <span className="text-gray-700 font-medium">
                  {isLoading ? 'Registering...' : 'Continue with GitHub'}
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200 pr-12`}
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200 pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </motion.div>

              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={isMounted ? { opacity: 1 } : {}}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="font-medium text-amber-600 hover:text-amber-500">Terms</a> and <a href="#" className="font-medium text-amber-600 hover:text-amber-500">Privacy Policy</a>
                </label>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={isMounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </motion.button>
            </form>

            <motion.div 
              className="mt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <p>
                Already have an account?{' '}
                <a href="/login" className="font-medium text-amber-600 hover:text-amber-500">
                  Sign in
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="mt-6 text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={isMounted ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <p>© {new Date().getFullYear()} DesignHive. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}