import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Utensils } from 'lucide-react';
import type { MenuItem } from '../types/pos';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMenuItem: (item: MenuItem) => void;
  categories: string[];
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  onAddMenuItem,
  categories,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Rice & Curry');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [price, setPrice] = useState(350);
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory =
      category === '__NEW__' && newCategoryInput.trim()
        ? newCategoryInput.trim()
        : category === '__NEW__'
        ? 'Specials'
        : category;

    const newItem: MenuItem = {
      id: 'm-' + Date.now(),
      name: name.trim(),
      category: finalCategory,
      price: Number(price) || 0,
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
      is_active: true,
    };

    onAddMenuItem(newItem);
    setName('');
    setImageUrl('');
    setNewCategoryInput('');
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
              <Utensils className="w-5 h-5 text-[#FF5A5F]" />
              <h2 className="text-lg font-bold font-poppins text-white">Add New Dish / Menu Item</h2>
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
                placeholder="e.g. Kottu Roti / Sea Food Curry"
                className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] placeholder-[#848796]/40"
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
                  <option value="__NEW__" className="bg-[#191A25] text-yellow-300 font-bold py-2">
                    + Add New Category
                  </option>
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

            {/* Optional New Category Input */}
            {category === '__NEW__' && (
              <div>
                <label className="text-xs font-semibold text-yellow-300 block mb-1.5">
                  New Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Desserts / Beverages"
                  className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-yellow-500/40 focus:outline-none focus:border-yellow-400 placeholder-[#848796]/40"
                />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                Image URL (Optional)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] placeholder-[#848796]/40"
              />
            </div>

            {/* Submit & Cancel Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242533]">
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
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
