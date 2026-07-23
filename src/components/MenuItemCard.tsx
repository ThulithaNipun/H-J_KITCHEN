import React from 'react';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import type { MenuItem } from '../types/pos';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onEditItem?: (item: MenuItem) => void;
  theme?: 'dark' | 'light';
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onEditItem,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onAddToCart(item)}
      className={`border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative ${
        isDark
          ? 'bg-[#1F202C] hover:bg-[#262737] border-[#282937] shadow-lg shadow-black/20'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-md shadow-slate-200/50'
      }`}
    >
      {/* Food Image Container */}
      <div
        className={`relative w-full h-36 rounded-xl overflow-hidden mb-3 ${
          isDark ? 'bg-[#181924]' : 'bg-slate-100'
        }`}
      >
        <img
          src={
            item.image_url ||
            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'
          }
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category Tag */}
        <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/10">
          {item.category}
        </span>

        {/* Edit Button */}
        {onEditItem && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditItem(item);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-[#FF5A5F] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Edit Item"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title & Metadata */}
      <div>
        <h3
          className={`font-semibold text-sm line-clamp-1 group-hover:text-[#FF5A5F] transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-[#FF5A5F] font-poppins">
            Rs. {item.price.toFixed(2)}
          </span>

          <span
            className={`text-[11px] font-medium ${
              isDark ? 'text-[#848796]' : 'text-slate-500'
            }`}
          >
            In Stock
          </span>
        </div>
      </div>
    </motion.div>
  );
};
