import { motion } from "framer-motion";

const DateDisplay = ({ label, date }) => {
  return (
    <motion.div
      className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
        borderColor: "#F59E0B",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
      }}
    >
      <motion.h3
        className="font-semibold text-yellow-600 mb-2 text-sm uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {label}
      </motion.h3>
      <motion.p
        className="text-gray-700 font-medium text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </motion.p>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-yellow-400 rounded-b-xl"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </motion.div>
  );
};

export default DateDisplay;
