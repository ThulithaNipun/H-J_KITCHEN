import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title = 'Delete Item?',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-[#191A25] border border-[#282937] text-white w-full max-w-md p-6 rounded-3xl shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-[#848796] hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/10">
            <AlertTriangle className="w-7 h-7" />
          </div>

          {/* Modal Title & Message */}
          <h3 className="text-lg font-bold font-poppins text-white mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-[#848796] leading-relaxed max-w-xs mb-6 font-medium">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 bg-[#262737] hover:bg-[#2F3045] text-white font-semibold text-xs py-3 px-4 rounded-2xl border border-[#282937] transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
            >
              Yes, Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
