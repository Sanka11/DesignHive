import React from 'react';
import { motion } from 'framer-motion';
import DesignHiveLogo from "../assets/DesignHiveLogo.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 text-gray-800 px-4 sm:px-6">
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
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain" 
        />
      </motion.div>

      {/* Title with Art Nuvo font */}
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl sm:text-5xl font-bold mb-4 text-center font-art-nuvo"
      >
        Welcome to <span className="text-blue-600">DesignHive</span> <span className="text-yellow-400">🐝</span>
      </motion.h1>

      {/* Responsive paragraph */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-base sm:text-lg mb-6 sm:mb-8 text-center max-w-md sm:max-w-xl px-4"
      >
        A collaborative platform to share, learn, and grow your UI/UX skills with creatives around the world.
      </motion.p>

      {/* Responsive buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-100 transition border border-blue-600 shadow-lg text-sm sm:text-base"
        onClick={() => window.location.href = '/login'}
        >
          Login
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-700 transition shadow-lg text-sm sm:text-base"
        onClick={() => window.location.href = '/register'}
        >
          Register
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage;