import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building } from 'lucide-react';
import type { BusinessSettings } from '../types/pos';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSave: (updated: BusinessSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(initialSettings);

  React.useEffect(() => {
    setFormData(initialSettings);
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-app-card border border-app-border w-full max-w-xl rounded-3xl p-6 shadow-2xl text-white my-8"
        >
          <div className="flex items-center justify-between border-b border-app-border pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-app-red" />
              <h2 className="text-lg font-bold font-poppins">Business & Invoice Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-app-text-secondary hover:text-white p-1 rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                Restaurant / Business Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                  Website / Social
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-app-red"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-app-text-secondary block mb-1">
                Invoice Footer Note
              </label>
              <textarea
                rows={2}
                value={formData.invoice_note}
                onChange={(e) => setFormData({ ...formData, invoice_note: e.target.value })}
                className="w-full bg-app-panel border border-app-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-app-red"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-app-border text-xs font-semibold text-app-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-app-red hover:bg-app-red-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-app-red/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
