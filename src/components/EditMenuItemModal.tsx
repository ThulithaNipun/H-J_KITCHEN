import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Edit } from 'lucide-react';
import type { MenuItem } from '../types/pos';

interface EditMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSaveItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  categories: string[];
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSaveItem,
  onDeleteItem,
  categories,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price);
      setImageUrl(item.image_url || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveItem({
      ...item,
      name: name.trim(),
      category: category.trim() || item.category,
      price: Number(price) || 0,
      image_url: imageUrl.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#191A25] border border-[#282937] text-white w-full max-w-lg p-6 rounded-3xl shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242533]">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#FF5A5F]" />
              <h2 className="text-lg font-bold font-poppins text-white">Edit Dish / Menu Item</h2>
            </div>

            <button
              onClick={onClose}
              className="text-[#848796] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dish Name */}
            <div>
              <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                Dish Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#191A25] text-white py-2">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-mono font-bold"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>

            {/* Submit, Delete & Cancel Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#242533]">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${item.name}" from menu?`)) {
                    onDeleteItem(item.id);
                    onClose();
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs py-2.5 px-4 rounded-xl border border-red-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#262737] hover:bg-[#2F3045] text-white font-semibold text-xs py-2.5 px-5 rounded-xl border border-[#282937] transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#FF5A5F] hover:bg-[#E04C51] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-[#FF5A5F]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
