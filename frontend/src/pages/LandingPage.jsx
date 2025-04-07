import React from 'react';
import { motion } from 'framer-motion';
import DesignHiveLogo from "../assets/DesignHiveLogo.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-white to-blue-50 text-gray-800 px-4 sm:px-6 py-8">
      <div className="w-full flex flex-col items-center justify-center flex-grow">
        {/* Logo with increased size and responsive sizing */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <img 
            src={DesignHiveLogo} 
            alt="DesignHive Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain" 
          />
        </motion.div>

        {/* Title with Art Nuvo font */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center font-art-nuvo px-2"
        >
          Welcome to <span className="text-blue-600">DesignHive</span> <span className="text-yellow-400">🐝</span>
        </motion.h1>

        {/* Responsive paragraph */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-center max-w-xs sm:max-w-md md:max-w-xl px-2 text-gray-600"
        >
          A collaborative platform to share, learn, and grow your UI/UX skills with creatives around the world.
        </motion.p>

        {/* Responsive buttons with improved touch targets */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-50 transition border border-blue-600 shadow-md text-sm sm:text-base font-medium w-full sm:w-auto"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base font-medium w-full sm:w-auto"
            onClick={() => window.location.href = '/register'}
          >
            Register
          </motion.button>
        </motion.div>
      </div>

      {/* Copyright notice with proper spacing */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-xs sm:text-sm text-gray-500 mt-8 sm:mt-12 text-center"
      >
        <p>© {new Date().getFullYear()} DesignHive. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default LandingPage;