// components/modals/ConfirmDialog.jsx
import { motion, AnimatePresence } from "framer-motion";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes, Confirm",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {title || "Confirm Action"}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {message || "Are you sure you want to proceed?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
