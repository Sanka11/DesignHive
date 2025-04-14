import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/useAuth"; // Import your auth context

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the authenticated user from your auth context
  const [plans, setPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return; // Don't fetch if user isn't available

    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `http://localhost:9090/api/learning-plans/user/${user.id}` // Use user.email or user.id
        );
        if (!response.ok) throw new Error("Failed to fetch plans");
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user]); // Add user to dependency array

  const handlePlanClick = (planId) => navigate(`/learning-plan/${planId}`);
  const handleCreateNewPlan = () => navigate("/create-plan");

  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50">
        <motion.div
          className="text-3xl font-bold text-yellow-400"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          🐝 Gathering honey...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search your honey-sweet plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-5 py-3 pr-12 rounded-2xl border border-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-md w-full text-black text-lg placeholder-yellow-400 bg-yellow-50"
          />
          {/* Clear (cut) button */}
          {searchQuery && (
            <motion.button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform
               text-yellow-600 hover:text-red-500
               transition-colors w-6 h-6 flex items-center justify-center"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Clear search"
            >
              <div className="w-full h-full inline-flex items-center justify-center leading-[0]">
                ❌
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Header with title + button */}
      <motion.header
        className="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h1 className="text-4xl font-extrabold text-yellow-500 drop-shadow-md">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block mr-2"
          >
            🐝
          </motion.span>
          My Learning Plans
        </h1>

        <motion.button
          onClick={handleCreateNewPlan}
          className="relative bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">+ New Plan</span>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fff_10%,transparent_100%)] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-[url('/images/honeycomb-pattern.svg')] opacity-5" />
        </motion.button>
      </motion.header>

      {/* Rest of your content remains unchanged */}
      <AnimatePresence>
        {filteredPlans.length === 0 ? (
          <motion.div
            className="text-center py-20 text-yellow-600 font-medium relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-5xl mb-2"
              animate={{
                x: [0, 50, 100, 150],
                y: [0, -10, 0, 10],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🐝
            </motion.div>
            No plans match your search.
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                onClick={() => handlePlanClick(plan.id)}
                className="relative bg-white rounded-3xl shadow-xl p-6 border-2 border-yellow-100 cursor-pointer hover:shadow-2xl transition-all duration-300 group"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 30, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  delay: index * 0.05,
                }}
              >
                <div className="absolute inset-0 bg-[url('/images/honeycomb-pattern.svg')] bg-[size:1.5rem] opacity-5" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-black">
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                      >
                        {plan.title}
                      </motion.span>
                    </h2>
                    <motion.span
                      className={`capitalize px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.status === "planned"
                          ? "bg-yellow-100 text-yellow-700 shadow-inner"
                          : plan.status === "in-progress"
                          ? "bg-blue-100 text-blue-700 shadow-inner"
                          : "bg-green-100 text-green-700 shadow-inner"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {plan.status}
                    </motion.span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2 italic relative">
                    {plan.description || "No description"}
                    <span className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-20 h-full" />
                  </p>

                  <ProgressBar progress={plan.progress || 0} />

                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <motion.span whileHover={{ x: 5 }} className="inline-block">
                      📅 {new Date(plan.startDate).toLocaleDateString()}
                    </motion.span>
                    <motion.span
                      whileHover={{ x: -5 }}
                      className="inline-block"
                    >
                      ⏳ {new Date(plan.endDate).toLocaleDateString()}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomePage;