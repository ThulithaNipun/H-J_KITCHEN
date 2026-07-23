import React from 'react';
import { Search, Plus, Store } from 'lucide-react';
import type { BusinessSettings } from '../types/pos';

interface HeaderBarProps {
  businessSettings: BusinessSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddMenuItemModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  businessSettings,
  searchQuery,
  setSearchQuery,
  openAddMenuItemModal,
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Title & Date */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-poppins">
          {businessSettings.name || 'H&J Kitchen'}
        </h1>
        <p className="text-xs text-[#848796] mt-0.5 font-medium">
          {currentDateFormatted}
        </p>
      </div>

      {/* Action Controls: Search Bar & Add Item */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848796]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu here...."
            className="w-full bg-[#1F202C] text-white placeholder-[#848796] text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] transition-all"
          />
        </div>

        {/* Quick Add Menu Item Button */}
        <button
          onClick={openAddMenuItemModal}
          className="flex items-center gap-2 bg-[#1F202C] hover:bg-[#262737] border border-[#282937] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#FF5A5F]" />
          <span>New Item</span>
        </button>
      </div>
    </header>
  );
};
