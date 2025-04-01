import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiBee, GiHoneycomb } from 'react-icons/gi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
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
              {isSubmitted ? 'Check your inbox!' : 'Reset your password'}
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

          {/* Form Content */}
          <div className="p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-6">
                  <svg className="mx-auto h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mt-4">Password Reset Sent</h2>
                  <p className="text-gray-600 mt-2">
                    We've sent instructions to <span className="font-medium">{email}</span>. 
                    Please check your email and follow the link to reset your password.
                  </p>
                </div>

                <motion.button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Resend Instructions
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.h2 
                  className="text-2xl font-bold text-gray-800 mb-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={isMounted ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Forgot Password?
                </motion.h2>
                <motion.p 
                  className="text-gray-600 mb-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={isMounted ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Enter your email and we'll send you reset instructions
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isMounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.4 }}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors duration-200"
                      placeholder="your@email.com"
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isMounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Reset Link'}
                  </motion.button>
                </form>
              </>
            )}

            <motion.div 
              className="mt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <p>
                Remember your password?{' '}
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
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p>© {new Date().getFullYear()} DesignHive. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}