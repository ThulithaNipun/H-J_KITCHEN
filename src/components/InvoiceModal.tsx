import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Plus, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { BusinessSettings, OrderItem } from '../types/pos';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessSettings: BusinessSettings;
  orderItems: OrderItem[];
  tableLabel: string;
  customerName: string;
  customerAddress: string;
  initialDiscountPct: number;
  initialTaxPct: number;
  onSaveOrderToHistory?: (finalItems: OrderItem[], receiptNo: number, custName: string, custAddress: string) => void;
}

const MINIMUM_ROWS = 8;

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  businessSettings,
  orderItems: initialOrderItems,
  customerName: initialCustomerName,
  customerAddress: initialCustomerAddress,
  initialDiscountPct,
  initialTaxPct,
  onSaveOrderToHistory,
}) => {
  const [editableItems, setEditableItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerAddress, setCustomerAddress] = useState(initialCustomerAddress);
  const [discountPct, setDiscountPct] = useState(initialDiscountPct);
  const [taxPct, setTaxPct] = useState(initialTaxPct);
  const [receiptNo] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const [printed, setPrinted] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Initialize table rows to have at least MINIMUM_ROWS (8 rows)
  useEffect(() => {
    if (!isOpen) return;

    const baseItems = initialOrderItems.map((item) => ({ ...item }));
    while (baseItems.length < MINIMUM_ROWS) {
      baseItems.push({
        id: 'blank-' + baseItems.length + '-' + Date.now(),
        name: '',
        qty: 0,
        price: 0,
      });
    }

    setEditableItems(baseItems);
    setCustomerName(initialCustomerName || 'Mr. Client');
    setCustomerAddress(initialCustomerAddress || '');
    setDiscountPct(initialDiscountPct);
    setTaxPct(initialTaxPct);
    setPrinted(false);
  }, [isOpen, initialOrderItems, initialCustomerName, initialCustomerAddress, initialDiscountPct, initialTaxPct]);

  if (!isOpen) return null;

  // Calculate Invoice Totals (Only valid items)
  const validItems = editableItems.filter(
    (item) => item.name.trim() !== '' && item.name !== 'Add Item Description Here...' && item.qty > 0
  );
  const subtotal = validItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxPct) / 100;
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Invoice Line Handlers
  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    setEditableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddLine = () => {
    const firstEmptyIndex = editableItems.findIndex(
      (item) => item.name.trim() === '' || item.name === 'Add Item Description Here...' || item.qty === 0
    );

    if (firstEmptyIndex !== -1) {
      setEditableItems((prev) =>
        prev.map((item, idx) =>
          idx === firstEmptyIndex
            ? { ...item, name: 'New Item Description', qty: 1, price: 100 }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        id: 'custom-' + Date.now(),
        name: 'New Item Description',
        qty: 1,
        price: 100,
      };
      setEditableItems((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteLine = (id: string) => {
    setEditableItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      while (filtered.length < MINIMUM_ROWS) {
        filtered.push({
          id: 'blank-' + filtered.length + '-' + Date.now(),
          name: '',
          qty: 0,
          price: 0,
        });
      }
      return filtered;
    });
  };

  // Export Invoice as Crisp High-Res A4 PNG Image with Proper File Extension
  const handleDownloadPng = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsGeneratingPng(true);

      const dataUrl = await toPng(invoiceRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        width: 794,
        height: 1123,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        },
      });

      // Clean filename (no # or special characters that confuse browser download engine)
      const cleanCustomer = (customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Invoice_${receiptNo}_${cleanCustomer}.png`;

      // Convert Data URL to Blob Object for reliable browser downloading
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 200);

      setPrinted(true);
      if (onSaveOrderToHistory) {
        onSaveOrderToHistory(validItems, receiptNo, customerName, customerAddress);
      }
    } catch (err) {
      console.error('Failed to export invoice PNG:', err);
      alert('Could not download image. Please try browser print instead.');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Browser Print Handler
  const handlePrint = () => {
    window.print();
    setPrinted(true);
    if (onSaveOrderToHistory) {
      onSaveOrderToHistory(validItems, receiptNo, customerName, customerAddress);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[94vh] bg-[#4E540C] text-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
        >
          {/* Sticky Top Control Bar */}
          <div className="no-print sticky top-0 z-30 bg-[#2D3107] text-white px-5 py-3 flex items-center justify-between border-b border-white/10 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-poppins font-bold text-xs md:text-sm text-yellow-300">
                A4 Green Invoice Preview
              </span>
              {printed && (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Download A4 PNG Button */}
              <button
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title="Download Standard A4 High-Res PNG Image"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isGeneratingPng ? 'Generating A4...' : 'Save as A4 PNG Image'}</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Invoice Sheet Body Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#4E540C] flex justify-center">
            {/* EXACT A4 DIMENSION SHEET CONTAINER (794px x 1123px aspect ratio) */}
            <div
              id="printable-invoice"
              ref={invoiceRef}
              className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-[#2B2E12] font-inter border border-[#4E540C]/20 w-[794px] min-h-[1123px] flex flex-col justify-between"
            >
              <div>
                {/* Header Bar: INVOICE title on Left, Logo on Right */}
                <div className="flex items-start justify-between border-b-2 border-[#4E540C]/20 pb-5 mb-6">
                  <div>
                    <h1 className="text-4xl font-black font-poppins tracking-wider text-[#4E540C] uppercase">
                      INVOICE
                    </h1>
                    <p className="text-xs font-bold text-[#6B6F4A] tracking-wider uppercase mt-1">
                      {businessSettings.name || 'H&J KITCHEN RESTAURANT'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h2 className="text-sm font-bold text-[#4E540C]">
                        {businessSettings.name || 'H&J KITCHEN'}
                      </h2>
                      <p className="text-[11px] text-[#6B6F4A]">{businessSettings.address}</p>
                      <p className="text-[11px] text-[#6B6F4A]">Tel: {businessSettings.phone}</p>
                    </div>
                    <div className="w-14 h-14 bg-white border border-[#4E540C]/20 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={businessSettings.logo_url || '/logo.webp'}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Top Metadata Block: Invoice Details (Left) & Bill To (Right) */}
                <div className="grid grid-cols-2 gap-6 mb-6 text-xs text-[#2B2E12]">
                  {/* Left Box: Invoice Details */}
                  <div className="space-y-2 bg-[#F4F6E6]/60 p-4 rounded-xl border border-[#4E540C]/10">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#4E540C] border-b border-[#4E540C]/20 pb-1.5 mb-2">
                      Invoice Details
                    </h3>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Invoice No</span>
                      <span className="font-mono font-black text-[#4E540C] text-sm">: #{receiptNo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Date</span>
                      <span className="font-mono font-bold text-[#2B2E12]">: {formattedDate}</span>
                    </div>
                  </div>

                  {/* Right Box: Bill To */}
                  <div className="space-y-2 bg-[#F4F6E6]/60 p-4 rounded-xl border border-[#4E540C]/10">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#4E540C] border-b border-[#4E540C]/20 pb-1.5 mb-2">
                      Bill To
                    </h3>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Name</span>
                      <span className="font-bold text-[#2B2E12] mr-1.5">:</span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Mr. Client"
                        className="bg-transparent border-b border-transparent hover:border-[#4E540C]/30 focus:border-[#4E540C] focus:outline-none font-bold w-full py-0.5"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Address</span>
                      <span className="font-bold text-[#2B2E12] mr-1.5">:</span>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter Address"
                        className="bg-transparent border-b border-transparent hover:border-[#4E540C]/30 focus:border-[#4E540C] focus:outline-none font-medium w-full py-0.5 text-xs placeholder-[#6B6F4A]/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-[#4E540C]/30 rounded-xl overflow-hidden mb-6 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#4E540C] text-white text-xs uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3 text-center w-12 border-r border-white/20">SL.</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-3 text-center w-16 border-l border-r border-white/20">Qty</th>
                        <th className="py-2.5 px-3 text-right w-28 border-r border-white/20">Price</th>
                        <th className="py-2.5 px-4 text-right w-32">Amount</th>
                        <th className="py-2.5 px-1 no-print text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4E540C]/15 text-xs">
                      {editableItems.map((item, idx) => {
                        const isBlank =
                          item.name.trim() === '' ||
                          item.name === 'Add Item Description Here...' ||
                          item.qty === 0;

                        const lineTotal = item.qty * item.price;

                        return (
                          <tr
                            key={item.id}
                            className={idx % 2 === 1 ? 'bg-[#F4F6E6]' : 'bg-white'}
                          >
                            <td className="py-2 px-3 text-center font-bold text-[#6B6F4A] border-r border-[#4E540C]/10 font-mono text-xs">
                              {idx + 1}
                            </td>

                            <td className="py-2 px-4 font-medium text-[#2B2E12]">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                placeholder=""
                                className="w-full bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4E540C] rounded px-1.5 py-0.5 font-semibold text-xs border-b border-transparent hover:border-[#4E540C]/20"
                              />
                            </td>

                            <td className="py-2 px-3 text-center border-l border-r border-[#4E540C]/10">
                              {isBlank ? (
                                <input
                                  type="number"
                                  min="0"
                                  value=""
                                  onChange={(e) =>
                                    handleItemChange(item.id, 'qty', Math.max(0, Number(e.target.value)))
                                  }
                                  placeholder=""
                                  className="w-12 text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4E540C] rounded font-bold font-mono py-0.5 text-xs"
                                />
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) =>
                                    handleItemChange(item.id, 'qty', Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-12 text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4E540C] rounded font-bold font-mono py-0.5 text-xs"
                                />
                              )}
                            </td>

                            <td className="py-2 px-3 text-right font-mono border-r border-[#4E540C]/10">
                              {isBlank ? (
                                <input
                                  type="number"
                                  step="10"
                                  value=""
                                  onChange={(e) =>
                                    handleItemChange(item.id, 'price', Number(e.target.value))
                                  }
                                  placeholder=""
                                  className="w-20 text-right bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4E540C] rounded font-bold font-mono py-0.5 text-xs"
                                />
                              ) : (
                                <input
                                  type="number"
                                  step="10"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleItemChange(item.id, 'price', Number(e.target.value))
                                  }
                                  className="w-20 text-right bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4E540C] rounded font-bold font-mono py-0.5 text-xs"
                                />
                              )}
                            </td>

                            <td className="py-2 px-4 text-right font-mono font-bold text-[#2B2E12]">
                              {isBlank ? '' : `Rs. ${lineTotal.toFixed(2)}`}
                            </td>

                            <td className="py-2 px-1 no-print text-center">
                              {!isBlank && (
                                <button
                                  onClick={() => handleDeleteLine(item.id)}
                                  className="text-red-500 hover:text-red-700 p-0.5 transition-colors"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Add Line Item Trigger */}
                  <div className="no-print p-2.5 bg-[#F4F6E6]/80 border-t border-[#4E540C]/20 flex justify-start">
                    <button
                      onClick={handleAddLine}
                      className="flex items-center gap-1 text-xs font-bold text-[#4E540C] hover:text-black transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Line Item</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Section: Bank Payment Information & Note (Left) and Totals Summary (Right) */}
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 text-xs">
                  {/* Left Side: Bank Payment Details & Note */}
                  <div className="flex-1 space-y-3">
                    {/* Bank Payment Information */}
                    <div className="bg-[#F4F6E6]/60 p-4 rounded-xl border border-[#4E540C]/10 space-y-1.5">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#4E540C] border-b border-[#4E540C]/20 pb-1 mb-2">
                        Bank & Payment Information
                      </h4>
                      <div className="flex items-center">
                        <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Bank</span>
                        <span className="font-bold text-[#2B2E12]">: {businessSettings.bank_name || 'Commercial Bank'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">Account</span>
                        <span className="font-mono font-bold text-[#2B2E12]">: {businessSettings.bank_account || '8001234567'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 font-semibold text-[#6B6F4A] shrink-0">A/C Name</span>
                        <span className="font-bold text-[#2B2E12]">: {businessSettings.name || 'H&J Kitchen'}</span>
                      </div>
                    </div>

                    {/* Note Block */}
                    <div className="bg-[#F4F6E6]/60 p-3.5 rounded-xl border border-[#4E540C]/10">
                      <h4 className="font-bold text-[11px] uppercase text-[#4E540C] mb-1">
                        Note:
                      </h4>
                      <p className="text-[11px] text-[#6B6F4A] leading-relaxed">
                        {businessSettings.invoice_note}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Totals Summary */}
                  <div className="w-full md:w-72 bg-[#F4F6E6]/60 p-4 rounded-xl border border-[#4E540C]/10 space-y-2 font-semibold">
                    <div className="flex justify-between text-[#6B6F4A]">
                      <span>Sub Total</span>
                      <span className="font-mono text-[#2B2E12]">Rs. {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#6B6F4A]">
                      <span>Discount ({discountPct}%)</span>
                      <span className="font-mono text-red-600">- Rs. {discountAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#6B6F4A]">
                      <span>Tax ({taxPct}%)</span>
                      <span className="font-mono text-[#2B2E12]">+ Rs. {taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="bg-[#4E540C] text-white p-3 rounded-lg flex justify-between items-center mt-2 shadow-sm">
                      <span className="font-bold uppercase tracking-wider font-poppins text-xs">
                        Grand Total
                      </span>
                      <span className="font-bold font-poppins text-base text-yellow-300">
                        Rs. {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Green Footer Banner */}
              <div className="bg-[#4E540C] text-white p-4 rounded-xl text-center space-y-1 shadow-sm mt-auto">
                <h3 className="font-serif italic text-lg text-yellow-200">
                  Thank You & Come Again
                </h3>
                <p className="text-[11px] font-bold tracking-wider uppercase font-poppins">
                  {businessSettings.name || 'H&J KITCHEN RESTAURANT'}
                </p>
                <p className="text-[10px] text-white/80 font-mono">
                  Phone: {businessSettings.phone} | {businessSettings.website}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
