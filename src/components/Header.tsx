import React from 'react';
import { Fuel, Settings, Wifi, WifiOff, FileText, PlusCircle, Sun, Moon, Cloud } from 'lucide-react';
import { StationProfile } from '../types/invoice';

interface HeaderProps {
  isOnline: boolean;
  isCloudConnected: boolean;
  stationProfile: StationProfile;
  activeTab: 'create' | 'history';
  darkMode: boolean;
  onToggleDarkMode: () => void;
  setActiveTab: (tab: 'create' | 'history') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isCloudConnected,
  stationProfile,
  activeTab,
  darkMode,
  onToggleDarkMode,
  setActiveTab,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
              <Fuel className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate">
                {stationProfile.supplierName || 'VAT Fuel Invoice'}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                <span>Sri Lanka VAT 18% Tax Invoice</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cloud Sync Status Badge */}
            {isCloudConnected ? (
              <div
                className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                title="Connected to Firebase Cloud Storage"
              >
                <Cloud className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Cloud</span>
              </div>
            ) : null}

            {/* Online / Offline Status Badge */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xs:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings Gear Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Station, Rates & Cloud Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mt-2.5 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all active:scale-[0.98] ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all active:scale-[0.98] ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoice History</span>
          </button>
        </div>
      </div>
    </header>
  );
};
