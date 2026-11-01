'use client';

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Calculator,
  Database,
  Download,
  ListOrdered,
} from 'lucide-react';
import { GOOGLE_SHEET_URL, formatRupiah } from '@/lib/finance-data';
import { Transaction, TransactionFormData } from '@/types/finance';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSaldo: number;
  lastSyncedAt: string;
  onRefresh: () => void;
  isSyncing: boolean;
  totalTransactions: number;
  transactions?: Transaction[];
  onDirectAdd?: (data: TransactionFormData) => void;
}

export function GoogleSheetSyncModal({
  isOpen,
  onClose,
  currentSaldo,
  lastSyncedAt,
  onRefresh,
  isSyncing,
  totalTransactions,
  transactions = [],
  onDirectAdd,
}: GoogleSheetSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'simulator' | 'copyAll'>('info');

  // Simulator state
  const [simDate, setSimDate] = useState('31 July 2026');
  const [simDesc, setSimDesc] = useState('');
  const [simType, setSimType] = useState<'kredit' | 'debit'>('kredit');
  const [simAmount, setSimAmount] = useState<number>(0);
  const [simFaktur, setSimFaktur] = useState('Lihat Bukti Pembayaran');
  const [copiedRow, setCopiedRow] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const projectedSaldo =
    simType === 'debit' ? currentSaldo + (simAmount || 0) : currentSaldo - (simAmount || 0);

  const formattedRowString = `${simDate}\t${simDesc || 'Keterangan Transaksi'}\t${simType === 'debit' ? simAmount || 0 : ''}\t${simType === 'kredit' ? simAmount || 0 : ''}\t${projectedSaldo}\t${simFaktur}`;

  const handleCopySimulatorRow = () => {
    navigator.clipboard.writeText(formattedRowString);
    setCopiedRow(true);
    setTimeout(() => setCopiedRow(false), 2000);
  };

  const handleCopyAllRows = () => {
    const lines = transactions.map(
      (tx) =>
        `${tx.date}\t${tx.description}\t${tx.debit ? tx.debit : ''}\t${tx.kredit ? tx.kredit : ''}\t${tx.saldo}\t${tx.faktur}`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCommitSimulator = () => {
    if (!simDesc.trim() || !simAmount) return;
    if (onDirectAdd) {
      onDirectAdd({
        date: simDate,
        description: simDesc,
        type: simType,
        amount: simAmount,
        category: simType === 'debit' ? 'Kas & Modal Masuk' : 'Perlengkapan Properti & Cluster',
        recipientOrSource: simType === 'debit' ? 'Kas Masuk Kantor' : 'Operasional Kantor',
        faktur: simFaktur,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Integrasi Google Sheets & Sinkronisasi</h3>
              <p className="text-xs text-slate-400">Laporan Keuangan Kas Kantor ISMAYA PROPERTY</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Koneksi Sheet</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulasi Baris Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('copyAll')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'copyAll'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Salin Seluruh Data ({transactions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto flex-1">
          {activeTab === 'info' && (
            <>
              {/* Sheet URL card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sumber Data Spreadsheet Resmi
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Terhubung & Siap Sinkron
                  </span>
                </div>

                <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {GOOGLE_SHEET_URL}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-slate-400 text-[11px]">
                    Total {totalTransactions} transaksi terbaca otomatis
                  </span>
                  <a
                    href={GOOGLE_SHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Buka Spreadsheet Asli di Tab Baru
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Column Mapping Guide */}
              <div>
                <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">
                  Pemetaan Kolom Google Sheet:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom A:</span>
                    <span className="text-slate-300 font-sans">Tanggal (e.g. 13 July 2026)</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom B:</span>
                    <span className="text-slate-300 font-sans">Keterangan Transaksi</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom C:</span>
                    <span className="text-slate-300 font-sans">Debit / Kas Masuk</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom D:</span>
                    <span className="text-slate-300 font-sans">Kredit / Kas Keluar</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom E:</span>
                    <span className="text-slate-300 font-sans">Saldo Berjalan</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Kolom F:</span>
                    <span className="text-slate-300 font-sans">Faktur / Status Bukti</span>
                  </div>
                </div>
              </div>

              {/* Live Sync explanation */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200">Cara Sinkronisasi:</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Website ini terintegrasi 2 arah. Anda dapat mengubah dan menambah data langsung di website ini dengan tombol <strong className="text-white">&ldquo;Tambah Data&rdquo;</strong> atau <strong className="text-white">&ldquo;Edit&rdquo;</strong> pada baris tabel. Data juga dapat disinkronkan kapan saja dengan spreadsheet online melalui tombol <strong className="text-white">&ldquo;Sync Sheet&rdquo;</strong>.
                </p>
              </div>
            </>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                Uji dampak pengeluaran/penerimaan terhadap saldo kas kantor sebelum dimasukkan. Anda juga dapat langsung menambahkannya ke website atau menyalin format baris untuk Google Sheets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Tanggal Transaksi</label>
                  <input
                    type="text"
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimType('kredit')}
                      className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        simType === 'kredit'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Kredit (Keluar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimType('debit')}
                      className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        simType === 'debit'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Debit (Masuk)
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold text-[11px]">
                    Keterangan Transaksi
                  </label>
                  <input
                    type="text"
                    value={simDesc}
                    onChange={(e) => setSimDesc(e.target.value)}
                    placeholder="Contoh: Pembelian semen cluster / Biaya operasional"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    value={simAmount || ''}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    placeholder="Contoh: 500000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Status Faktur</label>
                  <select
                    value={simFaktur}
                    onChange={(e) => setSimFaktur(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Lihat Bukti Pembayaran">Lihat Bukti Pembayaran</option>
                    <option value="Lihat">Lihat</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
              </div>

              {/* Calculation Result */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Saldo Kas Saat Ini:</span>
                  <span className="font-mono font-bold text-white">{formatRupiah(currentSaldo)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Perubahan Transaksi:</span>
                  <span className={`font-mono font-bold ${simType === 'debit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simType === 'debit' ? '+' : '-'}
                    {formatRupiah(simAmount || 0)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Estimasi Saldo Baru:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {formatRupiah(projectedSaldo)}
                  </span>
                </div>
              </div>

              {/* Direct Add & Copy Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                {onDirectAdd && simDesc && simAmount > 0 && (
                  <button
                    onClick={handleCommitSimulator}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambahkan Langsung ke Web</span>
                  </button>
                )}
                <button
                  onClick={handleCopySimulatorRow}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  {copiedRow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRow ? 'Baris Tersalin!' : 'Salin Format Baris Sheet'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'copyAll' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Format Tab-Separated Seluruh Transaksi ({transactions.length} Baris)
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Data siap di-paste langsung ke Google Sheet (mulai dari sel A2).
                  </p>
                </div>
                <button
                  onClick={handleCopyAllRows}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Semua Tersalin!' : 'Salin Semua Data'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto font-mono text-[10px] text-slate-300 select-all whitespace-pre">
                {transactions
                  .map(
                    (tx) =>
                      `${tx.date}\t${tx.description}\t${tx.debit ? tx.debit : ''}\t${tx.kredit ? tx.kredit : ''}\t${tx.saldo}\t${tx.faktur}`
                  )
                  .join('\n')}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-t border-slate-800 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Muat Ulang dari Sheet'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
