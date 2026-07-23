import React from 'react';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  theme?: 'dark' | 'light';
}

const CATEGORY_ICONS: Record<string, string> = {
  'All Items': '🍛',
  'Rice & Curry': '🍚',
  'Specials': '⭐',
  'Yellow Rice': '🟡',
  'Fried Rice': '🍳',
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const allCategories = ['All Items', ...categories];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pt-1 pb-4 mb-4 no-scrollbar shrink-0">
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category;
        const icon = CATEGORY_ICONS[category] || '🍽️';

        return (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
              isSelected
                ? isDark
                  ? 'border-[#FF5A5F] text-white bg-[#1F202C]'
                  : 'border-[#FF5A5F] text-slate-900 bg-white shadow-sm'
                : isDark
                ? 'border-[#282937] text-[#848796] bg-[#1F202C] hover:bg-[#262737] hover:text-white'
                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm'
            }`}
          >
            <span className="text-sm leading-none">{icon}</span>
            <span className="leading-none">{category}</span>

            {isSelected && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 rounded-2xl border-2 border-[#FF5A5F] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
