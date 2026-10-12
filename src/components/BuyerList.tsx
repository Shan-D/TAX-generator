import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Phone, 
  MapPin, 
  Hash, 
  Check, 
  X,
  UserCheck,
  Building
} from 'lucide-react';
import { BuyerRecord } from '../types/invoice';

interface BuyerListProps {
  buyers: BuyerRecord[];
  isCloudConnected: boolean;
  onSaveBuyer: (buyer: Omit<BuyerRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteBuyer: (id: string) => void;
  onSelectBuyerForInvoice: (buyer: BuyerRecord) => void;
}

export const BuyerList: React.FC<BuyerListProps> = ({
  buyers,
  isCloudConnected,
  onSaveBuyer,
  onDeleteBuyer,
  onSelectBuyerForInvoice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New buyer form state
  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    phone: '',
    address: ''
  });

  // Filtered buyers based on search query
  const filteredBuyers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return buyers;
    return buyers.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.tin && b.tin.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.address && b.address.toLowerCase().includes(q))
    );
  }, [buyers, searchQuery]);

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({ name: '', tin: '', phone: '', address: '' });
    setIsAddingNew(true);
  };

  const handleStartEdit = (buyer: BuyerRecord) => {
    setIsAddingNew(false);
    setEditingId(buyer.id);
    setFormData({
      name: buyer.name || '',
      tin: buyer.tin || '',
      phone: buyer.phone || '',
      address: buyer.address || ''
    });
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ name: '', tin: '', phone: '', address: '' });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a buyer / company name.');
      return;
    }

    onSaveBuyer({
      id: editingId || undefined,
      name: formData.name.trim(),
      tin: formData.tin.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim()
    });

    handleCancelForm();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Usual & Frequent Buyers
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {buyers.length} Saved
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Buyer profiles are stored in {isCloudConnected ? 'Firebase Firestore & synchronized across devices' : 'local database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Usual Buyer</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by buyer name, TIN, telephone or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal or Inline Card */}
      {(isAddingNew || editingId) && (
        <form 
          onSubmit={handleSubmitForm}
          className="bg-brand-50/60 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border-2 border-brand-500/40 shadow-md space-y-3 transition-colors animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-brand-200/50 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm sm:text-base text-brand-900 dark:text-brand-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              {isAddingNew ? 'Add Frequent Buyer Profile' : 'Edit Buyer Profile'}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Buyer / Customer / Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AB Logistics (Pvt) Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purchaser TIN Number
              </label>
              <input
                type="text"
                placeholder="e.g. 109823471-7000"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telephone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +94 77 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Address
              </label>
              <input
                type="text"
                placeholder="e.g. 120 Kandy Road, Peradeniya"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{isAddingNew ? 'Save Buyer Profile' : 'Update Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Buyer Cards List */}
      {filteredBuyers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
            {searchQuery ? 'No buyers found matching your search' : 'No usual buyers saved yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? 'Try searching with a different name, TIN or phone number.' 
              : 'Add your frequent buyers here, or simply create an invoice—buyer details are automatically saved to the database for instant autofill!'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Buyer</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700/60 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {buyer.name}
                      </h3>
                      {buyer.tin ? (
                        <span className="text-[11px] font-mono font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1 mt-0.5">
                          <Hash className="w-3 h-3 text-slate-400" /> TIN: {buyer.tin}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No TIN recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(buyer)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Buyer Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete buyer "${buyer.name}" from saved database?`)) {
                          onDeleteBuyer(buyer.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Buyer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {buyer.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{buyer.phone}</span>
                    </div>
                  )}
                  {buyer.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{buyer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action Button: Create invoice for this buyer */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectBuyerForInvoice(buyer)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-[0.98]"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Create Invoice for this Buyer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
