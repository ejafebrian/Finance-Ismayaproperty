'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  FileText,
  Copy,
  Receipt,
  Eye,
  Check,
  PlusCircle,
  PiggyBank,
} from 'lucide-react';
import { Transaction } from '@/types/finance';
import { formatRupiah } from '@/lib/finance-data';
import { translations, Language } from '@/lib/translations';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onAddNewTransaction: () => void;
  selectedCategory: string | null;
  onClearCategory: () => void;
  initialBalance?: number;
  initialBalanceNote?: string;
  tabName?: string;
  lang?: Language;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export function TransactionLedger({
  transactions,
  onSelectTransaction,
  onAddNewTransaction,
  selectedCategory,
  onClearCategory,
  initialBalance = 0,
  initialBalanceNote,
  tabName,
  lang = 'id',
  onEditTransaction,
  onDeleteTransaction,
}: TransactionLedgerProps) {
  const currentLang: Language = (lang && translations[lang]) ? lang : 'id';
  const t = translations[currentLang] || translations.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'kredit'>('all');
  const [sortField, setSortField] = useState<'index' | 'date' | 'amount' | 'saldo'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (selectedCategory && tx.category !== selectedCategory) {
          return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(query);
          const matchRecipient = tx.recipientOrSource.toLowerCase().includes(query);
          const matchVoucher = tx.voucherNumber.toLowerCase().includes(query);
          const matchDate = tx.date.toLowerCase().includes(query);
          const matchAmount = String(tx.debit || tx.kredit).includes(query);

          if (!matchDesc && !matchRecipient && !matchVoucher && !matchDate && !matchAmount) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'index') {
          diff = a.index - b.index;
        } else if (sortField === 'amount') {
          const amtA = a.debit || a.kredit;
          const amtB = b.debit || b.kredit;
          diff = amtA - amtB;
        } else if (sortField === 'saldo') {
          diff = a.saldo - b.saldo;
        } else {
          diff = a.index - b.index;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [transactions, typeFilter, selectedCategory, searchQuery, sortField, sortOrder]);

  const currentSubtotals = useMemo(() => {
    let debit = 0;
    let kredit = 0;
    filteredTransactions.forEach((t) => {
      debit += t.debit;
      kredit += t.kredit;
    });
    return { debit, kredit, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const handleCopyRow = (tx: Transaction) => {
    const rowStr = `${tx.date}\t${tx.description}\t${tx.debit ? tx.debit : ''}\t${tx.kredit ? tx.kredit : ''}\t${tx.saldo}\t${tx.faktur}`;
    navigator.clipboard.writeText(rowStr);
    setCopiedId(tx.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Tanggal',
      'No_Bukti',
      'Keterangan',
      'Kategori',
      'Penerima_Sumber',
      'Debit_Masuk',
      'Kredit_Keluar',
      'Saldo_Berjalan',
      'Status_Faktur',
    ];
    const rows = filteredTransactions.map((t) => [
      t.index,
      `"${t.date}"`,
      `"${t.voucherNumber}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.recipientOrSource}"`,
      t.debit,
      t.kredit,
      t.saldo,
      `"${t.faktur}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_ISMAYA_PROPERTY_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: 'index' | 'date' | 'amount' | 'saldo') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-12">
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-lg">
                Buku Kas & Jurnal Transaksi {tabName ? `• ${tabName}` : ''}
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                {filteredTransactions.length} / {transactions.length} baris
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Catatan pembukuan kas operasional resmi tersinkronisasi dengan Google Sheets. Klik baris untuk melihat voucher slip.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddNewTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Transaksi</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.exportCsv}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                typeFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.allTransactions} ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('debit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                typeFilter === 'debit'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {t.cashIn}
            </button>
            <button
              onClick={() => setTypeFilter('kredit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                typeFilter === 'kredit'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60 shadow'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {t.cashOut}
            </button>
          </div>
        </div>

        {selectedCategory && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Kategori:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800/60 text-xs font-semibold text-emerald-300">
              {selectedCategory}
              <button onClick={onClearCategory} className="hover:text-white font-bold ml-1 cursor-pointer">
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center cursor-pointer" onClick={() => toggleSort('index')}>
                <div className="flex items-center justify-center gap-1">
                  <span>{t.tableNo}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[110px]">{t.tableDate}</th>
              <th className="py-3 px-4 min-w-[130px]">{t.tableVoucher}</th>
              <th className="py-3 px-4 min-w-[280px]">{t.tableDesc}</th>
              <th className="py-3 px-4 min-w-[140px] text-right cursor-pointer" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>{t.tableDebit}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[140px] text-right cursor-pointer" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>{t.tableKredit}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[140px] text-right cursor-pointer" onClick={() => toggleSort('saldo')}>
                <div className="flex items-center justify-end gap-1">
                  <span>{t.tableSaldo}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[130px] text-center">{t.tableReceipt}</th>
              <th className="py-3 px-4 min-w-[110px] text-center">{t.tableAction}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-medium">
            {/* Initial Balance Carry-over Row if tab has prior balance */}
            {initialBalance > 0 && typeFilter === 'all' && !searchQuery && !selectedCategory && (
              <tr className="bg-emerald-950/25 border-b border-emerald-800/40 text-emerald-200">
                <td className="py-3 px-4 text-center font-mono text-[11px] text-emerald-400 font-bold">
                  0
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-medium">
                  Awal Bulan
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                    SALDO-AWAL
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <PiggyBank className="w-4 h-4 text-emerald-400" />
                    <span>{initialBalanceNote || 'Sisa Saldo Kas Bulan Sebelumnya'}</span>
                  </div>
                  <div className="text-[10px] text-emerald-300/80 mt-0.5">
                    Bawaan kas dari lembar bulan sebelumnya
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">-</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">-</td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-300 font-mono text-xs">
                  {formatRupiah(initialBalance)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-700/60">
                    Bawaan Kas
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-[10px] text-slate-500 font-mono">
                  Sistem
                </td>
              </tr>
            )}

            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-sm font-semibold text-slate-300">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-slate-500">
                      Coba sesuaikan kata kunci pencarian atau tambahkan transaksi baru.
                    </p>
                    <button
                      onClick={onAddNewTransaction}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
                    >
                      + Tambah Transaksi Sekarang
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isCopied = copiedId === tx.id;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectTransaction(tx)}
                  >
                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {tx.index}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-medium">
                      {tx.date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:border-slate-600">
                        {tx.voucherNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {tx.description}
                        </span>
                        {tx.isCustomAdded && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {tx.recipientOrSource}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {tx.debit > 0 ? (
                        <span className="font-bold text-emerald-400 font-mono text-xs">
                          {formatRupiah(tx.debit)}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {tx.kredit > 0 ? (
                        <span className="font-bold text-rose-400 font-mono text-xs">
                          {formatRupiah(tx.kredit)}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-extrabold text-slate-200 font-mono text-xs">
                        {formatRupiah(tx.saldo)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        title="Klik untuk membuka voucher dan rincian bukti kas"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition active:scale-95 cursor-pointer ${
                          tx.faktur.toLowerCase().includes('cash')
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                        }`}
                      >
                        <Receipt className="w-3 h-3" />
                        <span>{tx.faktur}</span>
                      </button>
                    </td>

                    {/* Actions: View Voucher and Copy row (Trash and Edit buttons removed per user instruction) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectTransaction(tx)}
                          title={t.viewVoucher}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700 flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Voucher</span>
                        </button>

                        <button
                          onClick={() => handleCopyRow(tx)}
                          title={t.copyRow}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-white text-xs">
            <tr>
              <td colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider text-slate-400">
                Subtotal Tersaring ({currentSubtotals.count} Transaksi):
              </td>
              <td className="py-4 px-4 text-right text-emerald-400 font-mono text-sm">
                {formatRupiah(currentSubtotals.debit)}
              </td>
              <td className="py-4 px-4 text-right text-rose-400 font-mono text-sm">
                {formatRupiah(currentSubtotals.kredit)}
              </td>
              <td className="py-4 px-4 text-right text-emerald-300 font-mono text-sm">
                {formatRupiah(transactions[transactions.length - 1]?.saldo || 0)}
              </td>
              <td colSpan={2} className="py-4 px-4 text-center text-slate-400 text-[11px] font-normal">
                Sisa Saldo Kas Kantor
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
