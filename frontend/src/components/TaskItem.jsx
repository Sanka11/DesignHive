import { motion } from "framer-motion";

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <motion.div
      className="bg-white p-4 rounded-lg shadow-sm border border-honeycomb flex justify-between items-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center space-x-3">
        <motion.input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="h-5 w-5 text-honey-yellow rounded focus:ring-2 focus:ring-honey-yellow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
        <div>
          <h3
            className={`font-medium ${
              task.completed ? "line-through text-gray-400" : "text-bee-black"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-sm ${
                task.completed ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700"
        title="Delete Task"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
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
  );
};

export default TaskItem;
