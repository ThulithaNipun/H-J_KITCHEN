import React from 'react';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
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
}) => {
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
            className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-semibold transition-all shrink-0 border ${
              isSelected
                ? 'border-[#FF5A5F] text-white bg-[#1F202C]'
                : 'border-[#282937] text-[#848796] bg-[#1F202C] hover:bg-[#262737] hover:text-white'
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
