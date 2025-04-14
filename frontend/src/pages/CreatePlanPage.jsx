import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CreatePlanPage = () => {
  const [plan, setPlan] = useState({
    title: "",
    description: "",
    status: "planned",
    startDate: "",
    endDate: "",
    tasks: [{ title: "", description: "", completed: false }],
  });

  const [error, setError] = useState(""); // State for displaying error messages
  const [showSuccess, setShowSuccess] = useState(false); // State for showing success message
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleTaskChange = (index, e) => {
    const updatedTasks = [...plan.tasks];
    updatedTasks[index][e.target.name] =
      e.target.name === "completed" ? e.target.checked : e.target.value;
    setPlan({ ...plan, tasks: updatedTasks });
  };

  const addTask = () => {
    setPlan({
      ...plan,
      tasks: [...plan.tasks, { title: "", description: "", completed: false }],
    });
  };

  const removeTask = (index) => {
    const updatedTasks = [...plan.tasks];
    updatedTasks.splice(index, 1);
    setPlan({ ...plan, tasks: updatedTasks });
  };

  const validateForm = () => {
    // Check for plan title
    if (!plan.title.trim()) {
      setError("Title is required.");
      return false;
    }

    // Check for plan description
    if (!plan.description.trim()) {
      setError("Description is required.");
      return false;
    }

    // Check if start date is before end date
    if (new Date(plan.startDate) > new Date(plan.endDate)) {
      setError("Start Date cannot be later than End Date.");
      return false;
    }

    // Validate tasks
    for (let i = 0; i < plan.tasks.length; i++) {
      const task = plan.tasks[i];
      if (!task.title.trim() || !task.description.trim()) {
        setError(`Task ${i + 1} is missing title or description.`);
        return false;
      }
    }

    setError(""); // Reset any previous error message
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = { ...plan, userId: "user123" };
      await axios.post("http://localhost:9090/api/learning-plans", payload);

      // Show success animation
      setShowSuccess(true);

      // Wait for animation to complete before navigating
      setTimeout(() => {
        navigate("/learning-planhome");
      }, 3000); // Increased from 2000ms to 3000ms to ensure visibility
    } catch (error) {
      console.error(error);
      setError("Failed to create plan. Please try again.");
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-yellow-50 rounded-2xl shadow-xl mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-4xl font-extrabold text-yellow-600 mb-8 text-center drop-shadow-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        🐝 Create a New Learning Plan
      </motion.h1>
      {/* Error message display */}
      {error && (
        <motion.div
          className="bg-red-100 text-red-600 p-4 rounded-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>{error}</p>
        </motion.div>
      )}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 bg-yellow-50 p-6 rounded-2xl shadow-xl border border-yellow-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Plan Details */}
        <motion.input
          type="text"
          name="title"
          placeholder="Plan Title"
          value={plan.title}
          onChange={handleChange}
          className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm text-black placeholder-yellow-400 bg-white"
          required
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.textarea
          name="description"
          placeholder="Plan Description"
          value={plan.description}
          onChange={handleChange}
          className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm text-black placeholder-yellow-400 bg-white"
          required
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.select
          name="status"
          value={plan.status}
          onChange={handleChange}
          className="w-full p-3 border border-yellow-300 rounded-xl bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-black"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </motion.select>

        <div className="flex gap-4">
          <motion.input
            type="date"
            name="startDate"
            value={plan.startDate}
            onChange={handleChange}
            className="p-3 border border-yellow-300 rounded-xl w-1/2 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
            required
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          />
          <motion.input
            type="date"
            name="endDate"
            value={plan.endDate}
            onChange={handleChange}
            className="p-3 border border-yellow-300 rounded-xl w-1/2 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
            required
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Task Section */}
        <div>
          <motion.h2
            className="text-xl font-bold text-yellow-600 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            Tasks 🍯
          </motion.h2>
          {plan.tasks.map((task, index) => (
            <motion.div
              key={index}
              className="p-4 bg-white border border-yellow-200 rounded-xl mt-4 space-y-2 shadow-sm"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.input
                type="text"
                name="title"
                placeholder="Task Title"
                value={task.title}
                onChange={(e) => handleTaskChange(index, e)}
                className="w-full p-2 border border-yellow-300 rounded-md bg-yellow-50"
                required
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.textarea
                name="description"
                placeholder="Task Description"
                value={task.description}
                onChange={(e) => handleTaskChange(index, e)}
                className="w-full p-2 border border-yellow-300 rounded-md bg-yellow-50"
                required
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <label className="flex items-center gap-2 text-sm text-black">
                <input
                  type="checkbox"
                  name="completed"
                  checked={task.completed}
                  onChange={(e) => handleTaskChange(index, e)}
                  className="h-4 w-4 text-yellow-500"
                />
                Completed
              </label>
              {plan.tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="text-red-500 text-sm hover:underline"
                >
                  ❌ Remove Task
                </button>
              )}
            </motion.div>
          ))}

          <motion.button
            type="button"
            onClick={addTask}
            className="mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-xl shadow transition-all duration-300 relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Task
          </motion.button>
        </div>

        <div className="text-center">
          <motion.button
            type="submit"
            className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🐝 Create Plan
          </motion.button>
        </div>
      </motion.form>
      {showSuccess && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 20, -20, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🐝
            </motion.div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Success!
            </h2>
            <p className="text-gray-700 mb-4">
              Your learning plan has been created successfully.
            </p>
            <motion.div
              className="w-full bg-gray-200 rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              onAnimationComplete={() => navigate("/learning-planhome")}
            >
              <div className="bg-yellow-500 h-2 rounded-full"></div>
            </motion.div>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CreatePlanPage;
