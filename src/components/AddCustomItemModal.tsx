import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, PlusCircle } from 'lucide-react';
import type { OrderItem } from '../types/pos';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItem: (item: OrderItem) => void;
}

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItem,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(100);
  const [qty, setQty] = useState<number | ''>(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalQty = qty === '' || Number(qty) <= 0 ? 1 : Number(qty);
    const finalPrice = price === '' || Number(price) < 0 ? 0 : Number(price);

    const newItem: OrderItem = {
      id: 'custom-' + Date.now(),
      name: name.trim(),
      qty: finalQty,
      price: finalPrice,
    };

    onAddCustomItem(newItem);
    setName('');
    setPrice(100);
    setQty(1);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#191A25] border border-[#282937] text-white w-full max-w-md p-6 rounded-3xl shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242533]">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#FF5A5F]" />
              <h2 className="text-lg font-bold font-poppins text-white">Add Custom Item / Add-On</h2>
            </div>

            <button
              onClick={onClose}
              className="text-[#848796] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Custom Item Name */}
            <div>
              <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                Item Name / Add-On Description
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Extra Egg / Papadam / Fried Fish Piece"
                className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] placeholder-[#848796]/40 font-medium"
              />
            </div>

            {/* Price & Qty Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5"
                  value={price}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="100"
                  className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#848796] block mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qty}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1"
                  className="w-full bg-[#181924] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-mono font-bold"
                />
              </div>
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
                <span>Add to Order</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
