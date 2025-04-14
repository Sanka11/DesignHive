import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import TaskItem from "../components/TaskItem";
import DateDisplay from "../components/DateDisplay";
import { motion } from "framer-motion";
import axios from "axios";

const LearningPlanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [editedPlan, setEditedPlan] = useState({
    title: "",
    description: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9090/api/learning-plans/${id}`
        );
        setPlan(response.data);
        setEditedPlan({
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
        });
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("Failed to load plan. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const validateTaskForm = () => {
    if (!newTask.title.trim()) {
      setError("Task title is required");
      return false;
    }
    setError("");
    return true;
  };

  const validateEditForm = () => {
    if (!editedPlan.title.trim()) {
      setError("Plan title is required");
      return false;
    }
    if (!editedPlan.description.trim()) {
      setError("Plan description is required");
      return false;
    }
    if (new Date(editedPlan.startDate) > new Date(editedPlan.endDate)) {
      setError("Start Date cannot be later than End Date");
      return false;
    }
    setError("");
    return true;
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleTaskToggle = async (taskId) => {
    const updatedTasks = plan.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedPlan = {
      ...plan,
      tasks: updatedTasks,
      progress: calculateProgress(updatedTasks),
    };

    try {
      await axios.put(
        `http://localhost:9090/api/learning-plans/${id}`,
        updatedPlan
      );
      setPlan(updatedPlan);
      setSuccessMessage("Task updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    const task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
    };

    const updatedPlan = {
      ...plan,
      tasks: [...plan.tasks, task],
    };

    try {
      await axios.put(
        `http://localhost:9090/api/learning-plans/${id}`,
        updatedPlan
      );
      setPlan(updatedPlan);
      setNewTask({ title: "", description: "" });
      setSuccessMessage("Task added successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updatedTasks = plan.tasks.filter((task) => task.id !== taskId);
    const updatedPlan = {
      ...plan,
      tasks: updatedTasks,
      progress: calculateProgress(updatedTasks),
    };

    try {
      await axios.put(
        `http://localhost:9090/api/learning-plans/${id}`,
        updatedPlan
      );
      setPlan(updatedPlan);
      setSuccessMessage("Task deleted successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleUpdatePlan = async () => {
    if (!validateEditForm()) return;

    const updatedPlan = {
      ...plan,
      ...editedPlan,
    };

    try {
      await axios.put(
        `http://localhost:9090/api/learning-plans/${id}`,
        updatedPlan
      );
      setPlan(updatedPlan);
      setEditMode(false);
      setSuccessMessage("Plan updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error updating plan:", error);
      setError("Failed to update plan. Please try again.");
    }
  };

  const handleDeletePlan = async () => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await axios.delete(`http://localhost:9090/api/learning-plans/${id}`);
        setSuccessMessage("Plan deleted successfully");
        setShowSuccess(true);
        setTimeout(() => navigate("/learning-planhome"), 1500);
      } catch (error) {
        console.error("Error deleting plan:", error);
        setError("Failed to delete plan. Please try again.");
      }
    }
  };

  const handleCreateNewPlan = () => {
    navigate("/create-plan");
  };

  if (loading)
    return (
      <motion.div
        className="flex justify-center items-center h-screen bg-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-6xl text-yellow-500"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🐝
        </motion.div>
      </motion.div>
    );

  if (!plan)
    return (
      <motion.div
        className="flex justify-center items-center h-screen bg-yellow-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-2xl text-yellow-600">Plan not found</div>
      </motion.div>
    );

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-yellow-50 rounded-2xl shadow-xl mt-8 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Error message */}
      {error && (
        <motion.div
          className="bg-red-100 text-red-600 p-4 rounded-lg mb-6 shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p>{error}</p>
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        className="flex justify-between items-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {editMode ? (
          <motion.input
            type="text"
            className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm text-3xl font-bold bg-white text-yellow-600"
            value={editedPlan.title}
            onChange={(e) =>
              setEditedPlan({ ...editedPlan, title: e.target.value })
            }
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          />
        ) : (
          <motion.h1
            className="text-3xl font-bold text-yellow-600"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {plan.title}
          </motion.h1>
        )}

        <motion.div
          className="flex space-x-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => navigate("/learning-planhome")}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-2 px-4 rounded-xl shadow-sm transition duration-200"
            whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Plans
          </motion.button>
          <motion.button
            onClick={handleCreateNewPlan}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-xl shadow-sm transition duration-200"
            whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            🐝 Create New Plan
          </motion.button>
        </motion.div>
      </motion.header>

      {/* Plan Info */}
      <motion.div
        className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-yellow-200 relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {editMode ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.textarea
              className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm bg-white text-gray-700"
              value={editedPlan.description}
              onChange={(e) =>
                setEditedPlan({ ...editedPlan, description: e.target.value })
              }
              rows="3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileFocus={{
                borderColor: "#F59E0B",
                boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.3)",
              }}
            />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div
                className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <label className="font-semibold text-yellow-600 mb-2 block">
                  Status
                </label>
                <select
                  value={editedPlan.status}
                  onChange={(e) =>
                    setEditedPlan({ ...editedPlan, status: e.target.value })
                  }
                  className="w-full p-2 border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-gray-700"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </motion.div>

              <motion.div
                className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="font-semibold text-yellow-600 mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-gray-700"
                  value={editedPlan.startDate}
                  onChange={(e) =>
                    setEditedPlan({ ...editedPlan, startDate: e.target.value })
                  }
                />
              </motion.div>

              <motion.div
                className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="font-semibold text-yellow-600 mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-gray-700"
                  value={editedPlan.endDate}
                  onChange={(e) =>
                    setEditedPlan({ ...editedPlan, endDate: e.target.value })
                  }
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-end space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button
                onClick={() => setEditMode(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-xl shadow-sm transition duration-200"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdatePlan}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-xl shadow-sm transition duration-200"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                🐝 Save Changes
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="absolute top-4 right-4 flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition shadow-sm"
                title="Edit Plan"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </motion.button>
              <motion.button
                onClick={handleDeletePlan}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow-sm"
                title="Delete Plan"
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            </motion.div>

            <motion.p
              className="text-gray-700 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {plan.description}
            </motion.p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div
                className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h3 className="font-semibold text-yellow-600 mb-2">Status</h3>
                <motion.span
                  className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${
                    plan.status === "planned"
                      ? "bg-yellow-100 text-yellow-800"
                      : plan.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {plan.status.replace("-", " ")}
                </motion.span>
              </motion.div>

              <DateDisplay label="Start Date" date={plan.startDate} />
              <DateDisplay label="End Date" date={plan.endDate} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ProgressBar progress={plan.progress} />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Tasks Section */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2
          className="text-2xl font-semibold text-yellow-600 mb-6 flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <span className="mr-2">Tasks 🍯</span>
          <motion.span
            className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full"
            whileHover={{ scale: 1.1 }}
          >
            {plan.tasks.filter((t) => t.completed).length}/{plan.tasks.length}
          </motion.span>
        </motion.h2>

        <motion.div
          className="space-y-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {plan.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                delay: index * 0.05,
              }}
            >
              <TaskItem
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleDeleteTask}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.form
          onSubmit={handleAddTask}
          className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h3
            className="font-medium text-yellow-600 mb-4 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Add New Task
          </motion.h3>
          <div className="space-y-4">
            <motion.input
              type="text"
              placeholder="Task title"
              className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              required
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileFocus={{
                borderColor: "#F59E0B",
                boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.3)",
              }}
            />
            <motion.textarea
              placeholder="Description (optional)"
              className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
              rows="2"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileFocus={{
                borderColor: "#F59E0B",
                boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.3)",
              }}
            />
            <motion.button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition w-full"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              + Add Task
            </motion.button>
          </div>
        </motion.form>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="text-center text-sm text-yellow-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>
          Created on {new Date(plan.createdAt).toLocaleDateString()} • Last
          updated {new Date(plan.updatedAt).toLocaleDateString()}
        </p>
      </motion.footer>

      {/* Success Notifications */}
      {showSuccess && (
        <motion.div
          className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <motion.div
            className="mr-2 text-xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 20, 0],
            }}
            transition={{ duration: 0.8 }}
          >
            🐝
          </motion.div>
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Full-screen Success Animation for Major Actions */}
      {showSuccess &&
        (successMessage.includes("deleted") ||
          successMessage.includes("updated")) && (
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
              <p className="text-gray-700 mb-4">{successMessage}</p>
              <motion.div
                className="w-full bg-gray-200 rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
              >
                <div className="bg-yellow-500 h-2 rounded-full"></div>
              </motion.div>
              <p className="text-sm text-gray-500 mt-2">
                {successMessage.includes("deleted")
                  ? "Redirecting..."
                  : "Applying changes..."}
              </p>
            </motion.div>
          </motion.div>
        )}
    </motion.div>
  );
};

export default LearningPlanPage;
