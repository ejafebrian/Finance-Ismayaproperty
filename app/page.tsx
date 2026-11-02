'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { SheetTabSelector } from '@/components/SheetTabSelector';
import { MonthlyRecapBridge } from '@/components/MonthlyRecapBridge';
import { ExecutiveMetrics } from '@/components/ExecutiveMetrics';
import { FinancialCharts } from '@/components/FinancialCharts';
import { TransactionLedger } from '@/components/TransactionLedger';
import { VoucherModal } from '@/components/VoucherModal';
import { GoogleSheetSyncModal } from '@/components/GoogleSheetSyncModal';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import { PrintableReport } from '@/components/PrintableReport';
import { FinanceApiResponse, SheetTabInfo, Transaction, TransactionFormData } from '@/types/finance';
import {
  buildFallbackData,
  recalculateTabTransactions,
  computeMonthlyRecap,
  getIndonesianDateString,
  SHEET_TABS_CONFIG,
  GOOGLE_SHEET_URL,
} from '@/lib/finance-data';
import {
  FileSpreadsheet,
  Building2,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { Language } from '@/lib/translations';

const MULTITAB_STORAGE_KEY = 'ismaya_property_multitab_cash_v3';

export default function HomePage() {
  const [data, setData] = useState<FinanceApiResponse>(buildFallbackData('oktober'));
  const [activeTabId, setActiveTabId] = useState<string>('oktober');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type?: 'success' | 'info' | 'warn' } | null>(null);
  const [lang, setLang] = useState<Language>('id');

  // Modals & Selection state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 3800);
  };

  // Find active tab info
  const activeTab = useMemo(() => {
    return data.tabs.find((t) => t.id === activeTabId) || data.tabs[0] || {
      id: 'oktober',
      name: 'LAPKEU OKTOBER',
      gid: '663304332',
      monthLabel: 'Oktober 2026',
      initialBalance: 0,
      summary: data.summary,
      categories: data.categories,
      dailyTrend: data.dailyTrend,
      transactions: data.transactions,
    };
  }, [data.tabs, activeTabId, data.summary, data.categories, data.dailyTrend, data.transactions]);

  // Multi-month recapitulation and carryover bridge
  const recap = useMemo(() => {
    return computeMonthlyRecap(data.tabs);
  }, [data.tabs]);

  // Handle switching tabs
  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setSelectedCategory(null);
    const targetTab = data.tabs.find((t) => t.id === tabId);
    if (targetTab) {
      setData((prev) => ({
        ...prev,
        activeTabId: tabId,
        periodLabel: targetTab.monthLabel,
        summary: targetTab.summary,
        categories: targetTab.categories,
        dailyTrend: targetTab.dailyTrend,
        transactions: targetTab.transactions,
        sheetUrl: `${GOOGLE_SHEET_URL}&gid=${targetTab.gid}`,
      }));
    }
  };

  // Manual refresh callback from Google Sheet
  const handleManualRefresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/finance?tab=${activeTabId}&t=${Date.now()}`);
      if (res.ok) {
        const json: FinanceApiResponse = await res.json();
        
        // Check if user has local modifications saved
        const saved = localStorage.getItem(MULTITAB_STORAGE_KEY);
        if (saved) {
          try {
            const localTabs: Record<string, Transaction[]> = JSON.parse(saved);
            const mergedTabs = json.tabs.map((tab) => {
              const localTxs = localTabs[tab.id];
              if (Array.isArray(localTxs) && localTxs.length > 0) {
                return recalculateTabTransactions(
                  localTxs,
                  tab.initialBalance,
                  tab.initialBalanceNote,
                  tab.id,
                  'user_modified'
                );
              }
              return tab;
            });

            const current = mergedTabs.find((t) => t.id === activeTabId) || mergedTabs[0];
            setData({
              ...json,
              tabs: mergedTabs,
              activeTabId: current.id,
              periodLabel: current.monthLabel,
              summary: current.summary,
              categories: current.categories,
              dailyTrend: current.dailyTrend,
              transactions: current.transactions,
              isLocallyModified: mergedTabs.some((t) => t.isLocallyModified),
            });
            showToast('Data Google Sheet disinkronkan dan digabung dengan catatan lokal.', 'info');
            return;
          } catch (e) {
            console.error('Failed to parse local multi-tab cache:', e);
          }
        }

        const current = json.tabs.find((t) => t.id === activeTabId) || json.tabs[0];
        setData({
          ...json,
          activeTabId: current.id,
          periodLabel: current.monthLabel,
          summary: current.summary,
          categories: current.categories,
          dailyTrend: current.dailyTrend,
          transactions: current.transactions,
        });
        showToast(
          `Berhasil menyinkronkan seluruh lembar kerja (${json.tabs.length} TAB) langsung dari Google Sheets!`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to sync finance data:', err);
      showToast('Gagal terhubung ke Google Sheet. Menampilkan data lokal.', 'warn');
    } finally {
      setIsSyncing(false);
    }
  }, [activeTabId]);

  // Initial load
  useEffect(() => {
    let ignore = false;

    const loadInitial = async () => {
      // 1. Check local storage
      const saved = localStorage.getItem(MULTITAB_STORAGE_KEY);
      let localTabsData: Record<string, Transaction[]> | null = null;
      if (saved) {
        try {
          localTabsData = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load local multitab cache:', e);
        }
      }

      // 2. Fetch live data
      try {
        const res = await fetch(`/api/finance?tab=oktober&t=${Date.now()}`);
        if (res.ok && !ignore) {
          const json: FinanceApiResponse = await res.json();
          if (localTabsData) {
            const mergedTabs = json.tabs.map((tab) => {
              const localTxs = localTabsData![tab.id];
              if (Array.isArray(localTxs) && localTxs.length > 0) {
                return recalculateTabTransactions(
                  localTxs,
                  tab.initialBalance,
                  tab.initialBalanceNote,
                  tab.id,
                  'user_modified'
                );
              }
              return tab;
            });
            const current = mergedTabs.find((t) => t.id === 'oktober') || mergedTabs[0];
            setData({
              ...json,
              tabs: mergedTabs,
              activeTabId: current.id,
              periodLabel: current.monthLabel,
              summary: current.summary,
              categories: current.categories,
              dailyTrend: current.dailyTrend,
              transactions: current.transactions,
              isLocallyModified: mergedTabs.some((t) => t.isLocallyModified),
            });
            return;
          }

          const current = json.tabs.find((t) => t.id === 'oktober') || json.tabs[0];
          setData({
            ...json,
            activeTabId: current.id,
            periodLabel: current.monthLabel,
            summary: current.summary,
            categories: current.categories,
            dailyTrend: current.dailyTrend,
            transactions: current.transactions,
          });
        }
      } catch (err) {
        console.error('Initial multi-tab load error:', err);
      }
    };

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Save transaction (add or edit) into specific tab
  const handleSaveTransaction = (formData: TransactionFormData, editId?: string) => {
    const targetTabId = formData.tabId || activeTabId;
    const targetTab = data.tabs.find((t) => t.id === targetTabId) || activeTab;

    let updatedTxs: Transaction[] = [];

    if (editId) {
      // Find if transaction is in target tab
      updatedTxs = targetTab.transactions.map((tx) => {
        if (tx.id === editId) {
          return {
            ...tx,
            date: formData.date,
            description: formData.description,
            type: formData.type,
            debit: formData.type === 'debit' ? formData.amount : 0,
            kredit: formData.type === 'kredit' ? formData.amount : 0,
            category: formData.category,
            recipientOrSource: formData.recipientOrSource,
            faktur: formData.faktur,
            notes: formData.notes,
            tabId: targetTabId,
            isModified: true,
          };
        }
        return tx;
      });
      showToast(`Transaksi "${formData.description}" pada tab ${targetTab.name} berhasil diperbarui!`, 'success');
    } else {
      const newTx: Transaction = {
        id: `TX-${targetTabId}-CUSTOM-${Date.now()}`,
        index: targetTab.transactions.length + 1,
        date: formData.date,
        description: formData.description,
        type: formData.type,
        debit: formData.type === 'debit' ? formData.amount : 0,
        kredit: formData.type === 'kredit' ? formData.amount : 0,
        saldo: 0,
        category: formData.category,
        recipientOrSource: formData.recipientOrSource,
        faktur: formData.faktur,
        notes: formData.notes,
        voucherNumber: '',
        tabId: targetTabId,
        isCustomAdded: true,
      };
      updatedTxs = [...targetTab.transactions, newTx];
      showToast(`Transaksi baru berhasil ditambahkan ke TAB ${targetTab.name}!`, 'success');
    }

    const recalculatedTab = recalculateTabTransactions(
      updatedTxs,
      targetTab.initialBalance,
      targetTab.initialBalanceNote,
      targetTabId,
      'user_modified'
    );

    const updatedTabs = data.tabs.map((t) => (t.id === targetTabId ? recalculatedTab : t));

    // Save all tabs transactions map to local storage
    const storageMap: Record<string, Transaction[]> = {};
    updatedTabs.forEach((t) => {
      storageMap[t.id] = t.transactions;
    });
    localStorage.setItem(MULTITAB_STORAGE_KEY, JSON.stringify(storageMap));

    // If active tab was updated, update top level summary
    const current = updatedTabs.find((t) => t.id === activeTabId) || recalculatedTab;

    setData((prev) => ({
      ...prev,
      tabs: updatedTabs,
      activeTabId: current.id,
      periodLabel: current.monthLabel,
      summary: current.summary,
      categories: current.categories,
      dailyTrend: current.dailyTrend,
      transactions: current.transactions,
      isLocallyModified: true,
    }));
  };

  // Delete transaction from tab
  const handleDeleteTransaction = (id: string) => {
    const targetTab = activeTab;
    const targetTx = targetTab.transactions.find((t) => t.id === id);
    const updatedTxs = targetTab.transactions.filter((tx) => tx.id !== id);

    const recalculatedTab = recalculateTabTransactions(
      updatedTxs,
      targetTab.initialBalance,
      targetTab.initialBalanceNote,
      targetTab.id,
      'user_modified'
    );

    const updatedTabs = data.tabs.map((t) => (t.id === targetTab.id ? recalculatedTab : t));

    const storageMap: Record<string, Transaction[]> = {};
    updatedTabs.forEach((t) => {
      storageMap[t.id] = t.transactions;
    });
    localStorage.setItem(MULTITAB_STORAGE_KEY, JSON.stringify(storageMap));

    setData((prev) => ({
      ...prev,
      tabs: updatedTabs,
      summary: recalculatedTab.summary,
      categories: recalculatedTab.categories,
      dailyTrend: recalculatedTab.dailyTrend,
      transactions: recalculatedTab.transactions,
      isLocallyModified: true,
    }));

    showToast(`Transaksi "${targetTx?.description || id}" pada ${targetTab.name} berhasil dihapus.`, 'info');
  };

  // Reset to original Google Sheet data
  const handleResetToGoogleSheet = async () => {
    localStorage.removeItem(MULTITAB_STORAGE_KEY);
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/finance?refresh=true&tab=${activeTabId}&t=${Date.now()}`);
      if (res.ok) {
        const json: FinanceApiResponse = await res.json();
        const current = json.tabs.find((t) => t.id === activeTabId) || json.tabs[0];
        setData({
          ...json,
          activeTabId: current.id,
          periodLabel: current.monthLabel,
          summary: current.summary,
          categories: current.categories,
          dailyTrend: current.dailyTrend,
          transactions: current.transactions,
        });
        showToast('Semua TAB berhasil dikembalikan ke spreadsheet Google Sheet asli.', 'info');
      } else {
        const fallback = buildFallbackData(activeTabId);
        setData(fallback);
        showToast('Data kas dikembalikan ke data default.', 'info');
      }
    } catch {
      const fallback = buildFallbackData(activeTabId);
      setData(fallback);
      showToast('Data kas dikembalikan ke data default.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/80 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              syncToast.type === 'warn' ? 'bg-rose-400' : syncToast.type === 'info' ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          ></span>
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Screen View (Hidden when printing) */}
      <div className="print:hidden flex-1 flex flex-col">
        {/* Navigation Bar */}
        <Navbar
          isLive={data.source === 'live_googlesheet'}
          isSyncing={isSyncing}
          isLocallyModified={data.isLocallyModified}
          lastSyncedAt={data.lastSyncedAt}
          periodLabel={activeTab.monthLabel}
          onRefresh={handleManualRefresh}
          onResetData={handleResetToGoogleSheet}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsFormModalOpen(true);
          }}
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === 'id' ? 'en' : 'id'))}
        />

        {/* Hero & Quick Welcome Banner */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* TAB SPREADSHEET SELECTOR BAR */}
          <SheetTabSelector
            tabs={data.tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onOpenAddModalForTab={(tabId) => {
              setActiveTabId(tabId);
              setEditingTransaction(null);
              setFormDefaultDate(undefined);
              setIsFormModalOpen(true);
            }}
            onRefreshTabs={handleManualRefresh}
            isSyncing={isSyncing}
          />

          {/* MONTHLY RECAPITULATION & CARRY-OVER BRIDGE + AS-OF-TODAY */}
          <MonthlyRecapBridge
            recap={recap}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onOpenAddModalToday={(todayDateStr) => {
              const latestMonth = recap.months[recap.months.length - 1];
              if (latestMonth) {
                setActiveTabId(latestMonth.tabId);
              }
              setFormDefaultDate(todayDateStr || getIndonesianDateString(new Date()));
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
          />

          {/* Executive Overview Section */}
          <ExecutiveMetrics
            summary={activeTab.summary}
            periodLabel={activeTab.monthLabel}
            tabName={activeTab.name}
          />

          {/* Interactive Dynamic Charts */}
          <FinancialCharts
            dailyTrend={activeTab.dailyTrend}
            categories={activeTab.categories}
            totalKredit={activeTab.summary.totalKredit}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Local Changes Banner (shown when edits exist) */}
          {data.isLocallyModified && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    Mode Pengeditan Aktif (Tersimpan Lokal di Browser)
                  </h4>
                  <p className="text-[11px] text-amber-300/80">
                    Perubahan data pada lembar {activeTab.name} tersimpan otomatis. Anda dapat menyalin data ke Google Sheet atau mereset ke spreadsheet online.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800/70 text-amber-200 text-xs font-semibold border border-amber-700/50 cursor-pointer"
                >
                  Salin ke Sheet
                </button>
                <button
                  onClick={handleResetToGoogleSheet}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Reset ke Asli</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Interactive Ledger / Buku Kas Table */}
          <TransactionLedger
            transactions={activeTab.transactions}
            initialBalance={activeTab.initialBalance}
            initialBalanceNote={activeTab.initialBalanceNote}
            tabName={activeTab.name}
            onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsFormModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onAddNewTransaction={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
            selectedCategory={selectedCategory}
            onClearCategory={() => setSelectedCategory(null)}
            lang={lang}
          />

          {/* Google Sheets Information Callout */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-900/40 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  Terintegrasi Penuh 4 TAB Spreadsheet
                  <span className="text-[11px] font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                    Juli - Oktober 2026
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Data kas kantor di atas tersinkronisasi otomatis dengan 4 lembar kerja (TAB) Google Sheet ISMAYA PROPERTY: <strong className="text-slate-200">LAPKEU JULI</strong>, <strong className="text-slate-200">LAPKEU AGUSTUS</strong>, <strong className="text-slate-200">LAPKEU SEPTEMBER</strong>, dan <strong className="text-slate-200">LAPKEU OKTOBER</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Input Transaksi Baru</span>
              </button>
              <a
                href={`${GOOGLE_SHEET_URL}&gid=${activeTab.gid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/30 cursor-pointer"
              >
                <span>Buka Tab {activeTab.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </main>

        {/* Corporate Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 text-xs py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-slate-300">
                  ISMAYA PROPERTY &copy; {new Date().getFullYear()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Sistem Laporan Keuangan Kas Kantor Operasional Multi-Tab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit Keuangan 4 Tab Terverifikasi
              </span>
              <span>•</span>
              <a
                href={`${GOOGLE_SHEET_URL}&gid=${activeTab.gid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition underline"
              >
                Spreadsheet Tab: {activeTab.name}
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Printable Report Component (triggers when printing) */}
      <PrintableReport
        data={{
          ...data,
          transactions: activeTab.transactions,
          summary: activeTab.summary,
          categories: activeTab.categories,
          periodLabel: activeTab.monthLabel,
        }}
        recap={recap}
      />

      {/* Interactive Voucher / Receipt Slip Modal */}
      <VoucherModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={(tx) => {
          setSelectedTransaction(null);
          setEditingTransaction(tx);
          setIsFormModalOpen(true);
        }}
      />

      {/* Add / Edit Transaction Form Modal */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
          setFormDefaultDate(undefined);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialTransaction={editingTransaction}
        currentEndingBalance={activeTab.summary.saldoAkhir}
        activeTabId={activeTabId}
        tabs={data.tabs}
        defaultDate={formDefaultDate}
      />

      {/* Google Sheet Sync & Simulator Modal */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentSaldo={activeTab.summary.saldoAkhir}
        lastSyncedAt={data.lastSyncedAt}
        onRefresh={handleManualRefresh}
        isSyncing={isSyncing}
        totalTransactions={activeTab.transactions.length}
        transactions={activeTab.transactions}
        onDirectAdd={(formData) => handleSaveTransaction(formData)}
      />

    </div>
  );
}
