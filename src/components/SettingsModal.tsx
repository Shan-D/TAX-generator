import React, { useState } from 'react';
import { X, Save, Building2, Fuel, Hash, Check } from 'lucide-react';
import { StationProfile, FuelRates } from '../types/invoice';
import { setInvoiceSequence } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationProfile: StationProfile;
  fuelRates: FuelRates;
  onSave: (newProfile: StationProfile, newRates: FuelRates) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stationProfile,
  fuelRates,
  onSave
}) => {
  const [profile, setProfile] = useState<StationProfile>(stationProfile);
  const [rates, setRates] = useState<FuelRates>(fuelRates);
  const [nextSeqInput, setNextSeqInput] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile, rates);
    
    if (nextSeqInput.trim() !== '') {
      const num = parseInt(nextSeqInput, 10);
      if (!isNaN(num) && num > 0) {
        setInvoiceSequence(num);
      }
    }

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Station Settings & Rates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5">
          {/* Station Profile Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              Supplier Station Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Station Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.supplierName}
                  onChange={(e) => setProfile({ ...profile, supplierName: e.target.value })}
                  placeholder="e.g. LANKA FUEL MART (PVT) LTD"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier VAT / TIN Number *
                </label>
                <input
                  type="text"
                  required
                  value={profile.supplierTin}
                  onChange={(e) => setProfile({ ...profile, supplierTin: e.target.value })}
                  placeholder="e.g. 102983746-7000"
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Station Registered Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={profile.supplierAddress}
                  onChange={(e) => setProfile({ ...profile, supplierAddress: e.target.value })}
                  placeholder="e.g. No. 245, Kandy Road, Kelaniya"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telephone Number
                  </label>
                  <input
                    type="text"
                    value={profile.supplierPhone}
                    onChange={(e) => setProfile({ ...profile, supplierPhone: e.target.value })}
                    placeholder="+94 11 291 4321"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Place of Supply
                  </label>
                  <input
                    type="text"
                    value={profile.defaultPlaceOfSupply}
                    onChange={(e) => setProfile({ ...profile, defaultPlaceOfSupply: e.target.value })}
                    placeholder="e.g. Kelaniya"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Fuel Pricing Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Pump Fuel Rates (LKR / Litre incl. 18% VAT)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  95 Octane Petrol (Rs/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rates['95_PETROL']}
                  onChange={(e) => setRates({ ...rates, '95_PETROL': parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Super Diesel (Rs/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rates['SUPER_DIESEL']}
                  onChange={(e) => setRates({ ...rates, 'SUPER_DIESEL': parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  92 Petrol (Rs/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rates['92_PETROL']}
                  onChange={(e) => setRates({ ...rates, '92_PETROL': parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Auto Diesel (Rs/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rates['AUTO_DIESEL']}
                  onChange={(e) => setRates({ ...rates, 'AUTO_DIESEL': parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Sequence Number override */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-slate-500" />
              Invoice Sequence Counter
            </h3>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                Set Next Invoice Sequence Number (Optional):
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1 (will generate INV-2026-00001)"
                value={nextSeqInput}
                onChange={(e) => setNextSeqInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {savedNotice ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
