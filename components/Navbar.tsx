'use client';

import React from 'react';
import {
  RefreshCw,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Calendar,
  PlusCircle,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { GOOGLE_SHEET_URL } from '@/lib/finance-data';
import { IsmayaLogo } from '@/components/IsmayaLogo';
import { translations, Language } from '@/lib/translations';

interface NavbarProps {
  isLive: boolean;
  isSyncing: boolean;
  isLocallyModified?: boolean;
  lastSyncedAt: string;
  onRefresh: () => void;
  onResetData?: () => void;
  onOpenSyncModal: () => void;
  onOpenAddModal: () => void;
  periodLabel: string;
  lang: Language;
  onToggleLang: () => void;
}

export function Navbar({
  isLive,
  isSyncing,
  isLocallyModified,
  lastSyncedAt,
  onRefresh,
  onResetData,
  onOpenSyncModal,
  onOpenAddModal,
  periodLabel,
  lang,
  onToggleLang,
}: NavbarProps) {
  const t = translations[lang];

  const formattedSyncTime = React.useMemo(() => {
    if (!lastSyncedAt) return 'Baru saja';
    try {
      const d = new Date(lastSyncedAt);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Baru saja';
    }
  }, [lastSyncedAt]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Company Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1.5 shadow-lg flex items-center justify-center">
              <IsmayaLogo size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  ISMAYA <span className="text-emerald-400">PROPERTY</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Kantor Operasional
                </span>
                {isLocallyModified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Ada Editan Lokal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400/80" />
                Laporan Keuangan Kas Kantor • <span className="text-slate-200 font-medium">{periodLabel}</span>
              </p>
            </div>
          </div>

          {/* Right Action Toolbar */}
          <div className="flex items-center gap-2">
            
            {/* Primary Action: Tambah Transaksi */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-bold">Tambah Data</span>
            </button>

            {/* Sync Status Badge / Modal trigger */}
            <button
              onClick={onOpenSyncModal}
              title="Klik untuk detail integrasi Google Sheets"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="group-hover:underline">
                {isLive ? t.liveSheet : t.verifiedData}
              </span>
              <span className="text-slate-500 text-[11px]">({formattedSyncTime})</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              title="Ubah Bahasa / Change Language"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{lang.toUpperCase()}</span>
            </button>

            {/* Reset to Google Sheet button if locally modified */}
            {isLocallyModified && onResetData && (
              <button
                onClick={onResetData}
                title="Reset kembali ke data asli Google Sheet"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold border border-amber-800/50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset</span>
              </button>
            )}

            {/* Refresh Sync Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Sinkronkan ulang & periksa TAB baru dari Google Sheet"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyinkron...' : t.syncSheet}</span>
            </button>

            {/* Print Official Report */}
            <button
              onClick={handlePrint}
              title="Cetak Laporan Keuangan Resmi / Export PDF"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{t.print}</span>
            </button>

            {/* External Google Sheet Link */}
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">{t.openSheet}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
