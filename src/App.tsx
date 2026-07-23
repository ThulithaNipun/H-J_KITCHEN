import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuItemCard } from './components/MenuItemCard';
import { OrderRail } from './components/OrderRail';
import { InvoiceModal } from './components/InvoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { AddMenuItemModal } from './components/AddMenuItemModal';
import { EditMenuItemModal } from './components/EditMenuItemModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Plus, Edit3, Trash2, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

import type { MenuItem, OrderItem, BusinessSettings, Order } from './types/pos';
import {
  DEFAULT_BUSINESS_SETTINGS,
  INITIAL_MENU_ITEMS,
  fetchMenuItems,
  fetchBusinessSettings,
  saveOrderToSupabase,
  updateBusinessSettingsInSupabase,
  saveMenuItemToSupabase,
  deleteMenuItemFromSupabase,
  fetchOrderHistoryFromSupabase,
  deleteOrderFromSupabase,
  isSupabaseConfigured,
} from './lib/supabase';

export function App() {
  // Business Settings State
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('hj_business_settings');
    return saved ? JSON.parse(saved) : DEFAULT_BUSINESS_SETTINGS;
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('hj_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // Order Rail State
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('hj_current_order');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableLabel, setTableLabel] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  // Navigation & Filtering State
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Control State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Order History State
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hj_order_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Supabase Backend Sync on Load
  useEffect(() => {
    async function syncSupabaseBackend() {
      if (!isSupabaseConfigured()) return;
      try {
        const remoteSettings = await fetchBusinessSettings();
        if (remoteSettings) {
          setBusinessSettings(remoteSettings);
        }
        const remoteMenu = await fetchMenuItems();
        if (remoteMenu && remoteMenu.length > 0) {
          setMenuItems(remoteMenu);
        }
        const remoteOrders = await fetchOrderHistoryFromSupabase();
        if (remoteOrders && remoteOrders.length > 0) {
          setOrderHistory(remoteOrders);
        }
      } catch (err) {
        console.log('Supabase sync using local fallback data:', err);
      }
    }
    syncSupabaseBackend();
  }, []);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('hj_business_settings', JSON.stringify(businessSettings));
  }, [businessSettings]);

  useEffect(() => {
    localStorage.setItem('hj_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('hj_current_order', JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem('hj_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Toast notification helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Derived Categories
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category));
    return Array.from(set);
  }, [menuItems]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Items' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.is_active;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Order Rail Handlers
  const handleAddToCart = (menuItem: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem.id || i.name === menuItem.name);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          menu_item_id: menuItem.id,
          name: menuItem.name,
          qty: 1,
          price: menuItem.price,
        },
      ];
    });

    showToast(`Added "${menuItem.name}" to order!`);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateItemNotes = (itemId: string, notes: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleAddCustomItem = () => {
    const customItem: OrderItem = {
      id: 'custom-' + Date.now(),
      name: 'Custom Special / Add-On',
      qty: 1,
      price: 150,
    };
    setOrderItems((prev) => [...prev, customItem]);
    showToast('Added Custom Add-On to order!');
  };

  // Immediate Order History Save when "Print Invoice" button is clicked
  const handlePrintBillsAndOpenInvoice = async () => {
    if (orderItems.length === 0) return;

    const receiptNo = Math.floor(100000 + Math.random() * 900000);
    const newRecord: Order = {
      id: 'ord-' + Date.now(),
      receipt_no: receiptNo,
      table_label: tableLabel,
      customer_name: customerName || 'Mr. Client',
      customer_address: customerAddress,
      status: 'printed',
      discount_pct: discountPct,
      tax_pct: taxPct,
      created_at: new Date().toISOString(),
      items: [...orderItems],
    };

    // Save to Supabase and get the actual created database UUID
    const supabaseOrder = await saveOrderToSupabase(newRecord, orderItems);
    if (supabaseOrder && supabaseOrder.id) {
      newRecord.id = supabaseOrder.id;
    }

    setOrderHistory((prev) => [newRecord, ...prev]);
    showToast(`Order #${receiptNo} saved to history!`);

    setIsInvoiceModalOpen(true);
  };

  const handleDeleteOrderHistoryItem = (orderId: string) => {
    const targetOrder = orderHistory.find((o) => o.id === orderId);
    setOrderHistory((prev) => prev.filter((o) => o.id !== orderId));
    deleteOrderFromSupabase(orderId, targetOrder?.receipt_no).catch(() => {});
    showToast('Receipt deleted from history!');
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    const created = await saveMenuItemToSupabase(newItem);
    if (created && created.id) {
      newItem.id = created.id;
    }
    setMenuItems((prev) => [newItem, ...prev]);
    showToast(`Added "${newItem.name}" to menu!`);
  };

  const handleOpenEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleSaveMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    saveMenuItemToSupabase(updatedItem).catch(() => {});
    showToast(`Updated "${updatedItem.name}"!`);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    deleteMenuItemFromSupabase(itemId).catch(() => {});
    showToast('Item deleted from menu!');
  };

  const handleSaveSettings = (updated: BusinessSettings) => {
    setBusinessSettings(updated);
    updateBusinessSettingsInSupabase(updated).catch(() => {});
    showToast('Business settings saved!');
  };

  const handleReprintOrder = (pastOrder: Order) => {
    setOrderItems(pastOrder.items);
    setTableLabel(pastOrder.table_label);
    setCustomerName(pastOrder.customer_name || '');
    setCustomerAddress(pastOrder.customer_address || '');
    setDiscountPct(pastOrder.discount_pct);
    setTaxPct(pastOrder.tax_pct);
    setIsHistoryModalOpen(false);
    setIsInvoiceModalOpen(true);
  };

  // Framer Motion Container Stagger Variant
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="flex h-screen bg-[#14151D] text-white overflow-hidden font-inter relative">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400/20 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Left Sidebar Rail */}
      <Sidebar
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        openSettings={() => setIsSettingsModalOpen(true)}
        openHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto min-w-0 bg-[#14151D]">
        <HeaderBar
          businessSettings={businessSettings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openAddMenuItemModal={() => setIsAddMenuItemModalOpen(true)}
        />

        {/* View Switcher based on Sidebar Navigation */}
        {activeNavTab === 'menu' ? (
          /* Dedicated Menu Management View */
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#242533]">
              <div>
                <h2 className="text-xl font-bold text-white font-poppins flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6 text-[#FF5A5F]" />
                  <span>Menu Management</span>
                </h2>
                <p className="text-xs text-[#848796] mt-1 font-medium">
                  Add, edit prices, update categories, or delete dishes from your POS menu
                </p>
              </div>

              <button
                onClick={() => setIsAddMenuItemModalOpen(true)}
                className="bg-[#FF5A5F] hover:bg-[#E04C51] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5A5F]/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </div>

            {/* Category Filter */}
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Menu Items Grid */}
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8"
            >
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1F202C] hover:bg-[#262737] rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/20 transition-all duration-200"
                >
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-[#181924]">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-white line-clamp-1">{item.name}</h3>
                    <span className="text-base font-bold text-[#FF5A5F] font-poppins block mt-1">
                      Rs. {item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#282937]">
                    <button
                      onClick={() => handleOpenEditMenuItem(item)}
                      className="flex-1 bg-[#181924] hover:bg-white/10 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FF5A5F]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingMenuItem(item)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-colors cursor-pointer"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Standard POS Home Dashboard View */
          <>
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="flex-1">
              {filteredMenuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-[#848796]">
                  <span className="text-4xl mb-3">🔍</span>
                  <h3 className="text-base font-semibold text-white">No dishes found</h3>
                  <p className="text-xs mt-1 text-[#848796]/70">
                    Try searching for something else or pick another category
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8"
                >
                  {filteredMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                      onEditItem={handleOpenEditMenuItem}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 3. Right Pinned Order Rail */}
      <OrderRail
        orderItems={orderItems}
        tableLabel={tableLabel}
        setTableLabel={setTableLabel}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        discountPct={discountPct}
        setDiscountPct={setDiscountPct}
        taxPct={taxPct}
        setTaxPct={setTaxPct}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onUpdateItemNotes={handleUpdateItemNotes}
        onOpenAddCustomItem={handleAddCustomItem}
        onOpenInvoiceModal={handlePrintBillsAndOpenInvoice}
      />

      {/* 4. Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        businessSettings={businessSettings}
        orderItems={orderItems}
        tableLabel={tableLabel}
        customerName={customerName}
        customerAddress={customerAddress}
        initialDiscountPct={discountPct}
        initialTaxPct={taxPct}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={businessSettings}
        onSave={handleSaveSettings}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
        onAddMenuItem={handleAddMenuItem}
        categories={categories}
      />

      <EditMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onClose={() => {
          setIsEditMenuItemModalOpen(false);
          setEditingMenuItem(null);
        }}
        item={editingMenuItem}
        onSaveItem={handleSaveMenuItem}
        onDeleteItem={handleDeleteMenuItem}
        categories={categories}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orders={orderHistory}
        onReprintOrder={handleReprintOrder}
        onDeleteOrder={handleDeleteOrderHistoryItem}
      />

      {/* Custom Delete Confirmation Modal for Menu Dishes */}
      <DeleteConfirmationModal
        isOpen={!!deletingMenuItem}
        title="Delete Dish?"
        message={`Are you sure you want to delete "${deletingMenuItem?.name}" from your POS menu?`}
        onConfirm={() => {
          if (deletingMenuItem) {
            handleDeleteMenuItem(deletingMenuItem.id);
            setDeletingMenuItem(null);
          }
        }}
        onCancel={() => setDeletingMenuItem(null)}
      />
    </div>
  );
}

export default App;
