import React, { useState } from 'react';
import { X, Save, Building2, Fuel, Hash, Check, Cloud, Key, ExternalLink } from 'lucide-react';
import { StationProfile, FuelRates } from '../types/invoice';
import { setInvoiceSequence } from '../utils/storage';
import {
  FirebaseConfig,
  loadFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigured
} from '../config/firebase';

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
  const [activeTab, setActiveTab] = useState<'station' | 'firebase'>('station');
  const [profile, setProfile] = useState<StationProfile>(stationProfile);
  const [rates, setRates] = useState<FuelRates>(fuelRates);
  const [nextSeqInput, setNextSeqInput] = useState<string>('');
  const [fbConfig, setFbConfig] = useState<FirebaseConfig>(loadFirebaseConfig());
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

    // Save Firebase keys
    saveFirebaseConfig(fbConfig);

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const isCloudConnected = isFirebaseConfigured(fbConfig);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">App & Cloud Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('station')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'station'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-brand-500" />
            <span>Station Profile & Rates</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'firebase'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-brand-500" />
            <span>Firebase Cloud Storage</span>
            {isCloudConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'station' ? (
            <>
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
                      placeholder="PLC ALWIS ENTERPRICES"
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
                      placeholder="103417660-7000"
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
                      placeholder="144, ANAGARIKA DHARMAPALA MAWATHA, KANDY"
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
                        placeholder="+94 777769870"
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
                        placeholder="KANDY"
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

              {/* Sequence Counter */}
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
            </>
          ) : (
            /* TAB 2: FIREBASE CLOUD CONFIGURATION */
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-brand-500" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      Firebase Cloud Sync Status
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isCloudConnected ? 'Connected & Syncing to Cloud' : 'Local Storage Only (Keys Not Set)'}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isCloudConnected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isCloudConnected ? 'Connected' : 'Local Mode'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-brand-50/60 dark:bg-brand-950/40 p-3 rounded-xl border border-brand-200 dark:border-brand-900/50 space-y-1">
                <p className="font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> How to get free Firebase keys (100% Free):
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> and create a free project.</li>
                  <li>Click <strong>Add Web App</strong> to get your <code>firebaseConfig</code> credentials.</li>
                  <li>Paste your keys below and click <strong>Save Configuration</strong>!</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Key (apiKey)
                  </label>
                  <input
                    type="text"
                    value={fbConfig.apiKey}
                    onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project ID (projectId)
                    </label>
                    <input
                      type="text"
                      value={fbConfig.projectId}
                      onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                      placeholder="my-station-vat"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      App ID (appId)
                    </label>
                    <input
                      type="text"
                      value={fbConfig.appId}
                      onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                      placeholder="1:123456:web:abcd"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auth Domain (authDomain)
                  </label>
                  <input
                    type="text"
                    value={fbConfig.authDomain}
                    onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                    placeholder="my-station-vat.firebaseapp.com"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Storage Bucket
                    </label>
                    <input
                      type="text"
                      value={fbConfig.storageBucket}
                      onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                      placeholder="my-station-vat.appspot.com"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Messaging Sender ID
                    </label>
                    <input
                      type="text"
                      value={fbConfig.messagingSenderId}
                      onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {savedNotice ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Saved & Synced!</span>
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
