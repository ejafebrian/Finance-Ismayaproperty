'use client';

import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Receipt,
  User,
  Layers,
} from 'lucide-react';
import { SheetTabInfo, Transaction, TransactionFormData, TransactionType } from '@/types/finance';
import {
  formatRupiah,
  terbilangRupiah,
  PROPERTY_OFFICE_CATEGORIES,
  RECEIPT_STATUS_OPTIONS,
  SHEET_TABS_CONFIG,
  categorizeDescription,
} from '@/lib/finance-data';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData, editId?: string) => void;
  onDelete?: (id: string) => void;
  initialTransaction?: Transaction | null;
  currentEndingBalance: number;
  activeTabId?: string;
  tabs?: SheetTabInfo[];
  defaultDate?: string;
}

interface FormInnerProps {
  initialTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (data: TransactionFormData, editId?: string) => void;
  onDelete?: (id: string) => void;
  currentEndingBalance: number;
  activeTabId?: string;
  tabs?: SheetTabInfo[];
  defaultDate?: string;
}

function TransactionFormInner({
  initialTransaction,
  onClose,
  onSave,
  onDelete,
  currentEndingBalance,
  activeTabId = 'oktober',
  tabs = [],
  defaultDate,
}: FormInnerProps) {
  const isEditMode = Boolean(initialTransaction);

  const availableTabs = tabs.length > 0
    ? tabs.map((t) => ({ id: t.id, name: t.name, gid: t.gid, monthLabel: t.monthLabel, defaultDate: defaultDate || '30 October 2026' }))
    : SHEET_TABS_CONFIG;

  const currentTabCfg = availableTabs.find((c) => c.id === (initialTransaction?.tabId || activeTabId)) || availableTabs[0];

  const [tabId, setTabId] = useState<string>(initialTransaction?.tabId || activeTabId);
  const [date, setDate] = useState(
    initialTransaction
      ? initialTransaction.date
      : defaultDate || currentTabCfg.defaultDate || '1 November 2026'
  );
  const [description, setDescription] = useState(
    initialTransaction ? initialTransaction.description : ''
  );
  const [type, setType] = useState<TransactionType>(
    initialTransaction ? initialTransaction.type : 'kredit'
  );
  const [amount, setAmount] = useState<number>(
    initialTransaction
      ? initialTransaction.type === 'debit'
        ? initialTransaction.debit
        : initialTransaction.kredit
      : 0
  );
  const [category, setCategory] = useState(
    initialTransaction ? initialTransaction.category : 'Perlengkapan Properti & Cluster'
  );
  const [recipientOrSource, setRecipientOrSource] = useState(
    initialTransaction ? initialTransaction.recipientOrSource || '' : ''
  );
  const [faktur, setFaktur] = useState(
    initialTransaction ? initialTransaction.faktur || 'Lihat Bukti Pembayaran' : 'Lihat Bukti Pembayaran'
  );
  const [notes, setNotes] = useState(initialTransaction ? initialTransaction.notes || '' : '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabChange = (newTabId: string) => {
    setTabId(newTabId);
    if (!initialTransaction && !defaultDate) {
      const targetCfg = availableTabs.find((c) => c.id === newTabId);
      if (targetCfg && targetCfg.defaultDate) {
        setDate(targetCfg.defaultDate);
      }
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (!initialTransaction && val.length > 3) {
      const autoCat = categorizeDescription(val, type === 'debit');
      setCategory(autoCat.category);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'debit') {
      setCategory('Kas & Modal Masuk');
      if (!recipientOrSource) setRecipientOrSource('Kas Masuk Kantor / Bank');
    } else {
      if (category === 'Kas & Modal Masuk') {
        setCategory('Perlengkapan Properti & Cluster');
      }
      if (recipientOrSource === 'Kas Masuk Kantor / Bank') setRecipientOrSource('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Harap isi keterangan transaksi');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari Rp 0');
      return;
    }

    onSave(
      {
        date: date.trim() || defaultDate || '1 November 2026',
        description: description.trim(),
        type,
        amount: Math.abs(amount),
        category: category || (type === 'debit' ? 'Kas & Modal Masuk' : 'Pengeluaran Lainnya'),
        recipientOrSource: recipientOrSource.trim() || (type === 'debit' ? 'Kas Masuk Kantor' : 'Operasional Kantor'),
        faktur: faktur || 'Lihat Bukti Pembayaran',
        tabId,
        notes: notes.trim(),
      },
      initialTransaction ? initialTransaction.id : undefined
    );
    onClose();
  };

  // Projected impact
  const delta = type === 'debit' ? amount : -amount;
  const oldDelta = initialTransaction
    ? initialTransaction.type === 'debit'
      ? initialTransaction.debit
      : -initialTransaction.kredit
    : 0;
  const projectedBalance = isEditMode
    ? currentEndingBalance - oldDelta + delta
    : currentEndingBalance + delta;

  return (
    <div
      className="relative w-full max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isEditMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {isEditMode ? 'Ubah Data Transaksi Kas' : 'Tambah Transaksi Kas Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              ISMAYA PROPERTY • Lembar:{' '}
              <span className="text-emerald-400 font-bold">
                {availableTabs.find((c) => c.id === tabId)?.name || 'LAPKEU'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB SPREADSHEET SELECTOR */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Pilih Tab / Lembar Kerja Spreadsheet:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableTabs.map((cfg) => {
              const isSelected = tabId === cfg.id;
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => handleTabChange(cfg.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 text-white ring-1 ring-emerald-500/60 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-extrabold text-[11px] block truncate">{cfg.name}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">gid: {cfg.gid}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Type Buttons */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1.5 uppercase text-[10px] tracking-wider">
            Jenis Transaksi Kas
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('kredit')}
              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                type === 'kredit'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              <span>Kas Keluar (Kredit / Beban)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('debit')}
              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                type === 'debit'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Kas Masuk (Debit / Modal)</span>
            </button>
          </div>
        </div>

        {/* Amount Field with Indonesian Rupiah preview & Terbilang */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              Nominal Transaksi (IDR)
            </label>
            <span
              className={`font-mono font-extrabold text-sm ${
                type === 'debit' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatRupiah(amount || 0)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-mono text-sm">
              Rp
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Contoh: 1500000"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {amount > 0 && (
            <div className="pt-1 text-[11px] text-slate-400 italic">
              Terbilang:{' '}
              <span className="text-slate-200 font-medium">
                &ldquo;{terbilangRupiah(amount)}&rdquo;
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
            Keterangan & Rincian Transaksi
          </label>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Contoh: Pembayaran Pajak Notaris / Beli token listrik / Gaji"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          />
          {/* Quick Suggestions based on spreadsheet context */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] text-slate-500 self-center">Contoh cepat:</span>
            {[
              'Pembayaran Pajak Penjual rumah ke Notaris',
              'Pembayaran tunggakan PBB',
              'Pembelian token listrik kantor',
              'Pembayaran Iuran Kebersihan Kav A1',
              'Gaji Resty',
              'Transfer Pak Kukuh',
              'Transfer Bu Iweng',
              'Uang Masuk Kas',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setDescription(sample);
                  if (sample.includes('Uang Masuk')) {
                    handleTypeChange('debit');
                  } else {
                    handleTypeChange('kredit');
                  }
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Category in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Transaksi
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Contoh: 1 November 2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Kategori Transaksi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {PROPERTY_OFFICE_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipient and Receipt Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {type === 'debit' ? 'Diterima Dari / Sumber' : 'Dibayarkan Kepada / Penerima'}
            </label>
            <input
              type="text"
              value={recipientOrSource}
              onChange={(e) => setRecipientOrSource(e.target.value)}
              placeholder={
                type === 'debit' ? 'Contoh: Kas Kantor / Transfer Masuk' : 'Contoh: Notaris / Pak Kukuh / Toko'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-[11px] flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              Status Bukti / Faktur
            </label>
            <select
              value={faktur}
              onChange={(e) => setFaktur(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {RECEIPT_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Impact preview card */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dampak Saldo Kas</span>
            <span className="text-xs text-slate-300">
              Saldo Saat Ini:{' '}
              <strong className="text-white font-mono">{formatRupiah(currentEndingBalance)}</strong>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Proyeksi Saldo Baru</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {formatRupiah(projectedBalance)}
            </span>
          </div>
        </div>

        {/* Delete confirmation section if in edit mode */}
        {isEditMode && onDelete && (
          <div className="pt-2 border-t border-slate-800">
            {isConfirmingDelete ? (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center justify-between">
                <div className="text-xs">
                  <strong>Hapus transaksi ini?</strong> Saldo kas akan dihitung ulang.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialTransaction!.id);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Transaksi Ini dari Lembar {availableTabs.find((c) => c.id === tabId)?.name}</span>
              </button>
            )}
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditMode ? 'Simpan Perubahan' : 'Tambahkan ke Pembukuan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTransaction,
  currentEndingBalance,
  activeTabId,
  tabs,
  defaultDate,
}: TransactionFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <TransactionFormInner
        key={initialTransaction ? initialTransaction.id : `new-tx-${activeTabId || 'def'}-${defaultDate || ''}`}
        initialTransaction={initialTransaction}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        currentEndingBalance={currentEndingBalance}
        activeTabId={activeTabId}
        tabs={tabs}
        defaultDate={defaultDate}
      />
    </div>
  );
}
