'use client';

import React from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SheetTabInfo } from '@/types/finance';
import { formatRupiah, GOOGLE_SHEET_URL } from '@/lib/finance-data';

interface SheetTabSelectorProps {
  tabs: SheetTabInfo[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onOpenAddModalForTab: (tabId: string) => void;
  onRefreshTabs?: () => void;
  isSyncing?: boolean;
}

export function SheetTabSelector({
  tabs,
  activeTabId,
  onSelectTab,
  onOpenAddModalForTab,
  onRefreshTabs,
  isSyncing = false,
}: SheetTabSelectorProps) {
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">
              Lembar Kerja Spreadsheet (Sheet TABs)
            </h3>
            <span className="text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{tabs.length} Lembar Terdeteksi</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mendeteksi otomatis seluruh TAB di Google Spreadsheet. Jika Anda menambahkan lembar baru di Google Sheet, klik tombol sinkronisasi.
          </p>
        </div>

        {/* Current Tab Actions & Sync Tab Baru */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefreshTabs && (
            <button
              onClick={onRefreshTabs}
              disabled={isSyncing}
              title="Periksa dan sinkronkan jika ada lembar TAB baru di Google Sheets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
              <span>{isSyncing ? 'Mencari Tab Baru...' : 'Sinkronkan Tab Baru'}</span>
            </button>
          )}

          {currentTab && (
            <>
              <button
                onClick={() => onOpenAddModalForTab(currentTab.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Input ke {currentTab.name}</span>
              </button>
              <a
                href={`${GOOGLE_SHEET_URL}&gid=${currentTab.gid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka di Google Sheets (gid: {currentTab.gid})</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Tabs Dynamic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer relative border ${
                isActive
                  ? 'bg-slate-800/95 border-emerald-500/80 shadow-lg ring-1 ring-emerald-500/40 text-white'
                  : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs font-black tracking-tight mb-1 truncate">
                <FileSpreadsheet
                  className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
                />
                <span className={`truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>{tab.name}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] mt-1.5">
                <span className="text-slate-400 font-mono text-[10px]">
                  {tab.transactions.length} Transaksi
                </span>
                <span
                  className={`font-mono font-bold text-[11px] ${
                    isActive ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  {formatRupiah(tab.summary.saldoAkhir)}
                </span>
              </div>

              {tab.initialBalance > 0 && (
                <div className="mt-1 pt-1 border-t border-slate-800/60 text-[9px] text-slate-400 truncate">
                  Saldo Awal: {formatRupiah(tab.initialBalance)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
