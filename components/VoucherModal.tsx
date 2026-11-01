'use client';

import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
  Share2,
  Copy,
  Check,
  Edit3,
} from 'lucide-react';
import { Transaction } from '@/types/finance';
import { formatRupiah, terbilangRupiah } from '@/lib/finance-data';

interface VoucherModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: (tx: Transaction) => void;
}

export function VoucherModal({ transaction, onClose, onEdit }: VoucherModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'debit';
  const amount = isIncome ? transaction.debit : transaction.kredit;
  const voucherTitle = isIncome ? 'BUKTI KAS MASUK (BKM)' : 'BUKTI KAS KELUAR (BKK)';

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `VOUCHER ${voucherTitle}\nNo: ${transaction.voucherNumber}\nTanggal: ${transaction.date}\nNominal: ${formatRupiah(amount)}\nKeterangan: ${transaction.description}\nPenerima/Sumber: ${transaction.recipientOrSource}\nStatus: Terverifikasi ISMAYA PROPERTY`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Dokumen Bukti Kas Kantor
              </span>
              <h4 className="text-sm font-bold text-white">
                {transaction.voucherNumber} • {transaction.date}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title="Salin Rincian"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              title="Cetak Voucher"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          
          {/* Company Kop Surat */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  ISMAYA PROPERTY
                </h2>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Developer & Real Estate Office Management
                </p>
                <p className="text-[11px] text-slate-500">
                  Percetakan Negara & Properti Komersial • Jakarta
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded text-xs font-black tracking-wider uppercase ${
                isIncome ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {voucherTitle}
              </span>
              <div className="mt-1 font-mono text-xs font-bold text-slate-700">
                {transaction.voucherNumber}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                {isIncome ? 'Diterima Dari' : 'Dibayarkan Kepada'}
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {transaction.recipientOrSource}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                Tanggal Transaksi
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {transaction.date}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                Untuk Keperluan / Keterangan
              </span>
              <p className="font-semibold text-slate-950 text-sm mt-0.5">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium text-[10px]">
                  Kategori: {transaction.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium text-[10px]">
                  Status Lampiran: {transaction.faktur}
                </span>
              </div>
            </div>
          </div>

          {/* Nominal Box */}
          <div className="bg-emerald-50/70 border-2 border-emerald-500/50 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Jumlah Nominal (IDR)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight font-mono">
                {formatRupiah(amount)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-200 text-xs">
              <span className="text-emerald-900 font-bold block mb-0.5">Terbilang:</span>
              <span className="text-emerald-950 italic font-semibold">
                &ldquo;{terbilangRupiah(amount)}&rdquo;
              </span>
            </div>
          </div>

          {/* Signature Boxes */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px]">
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <span className="text-slate-500 font-semibold block mb-12">
                Dibuat Oleh (Finance)
              </span>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                Staff Keuangan
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <span className="text-slate-500 font-semibold block mb-12">
                Diperiksa (Accounting)
              </span>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                Supervisor Akun
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <span className="text-slate-500 font-semibold block mb-12">
                Disetujui (Pimpinan)
              </span>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                Direktur ISMAYA
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tervalidasi Sistem Pembukuan Terintegrasi Google Sheets</span>
            </div>
            <span className="font-mono text-slate-400">
              Ref: ROW-{transaction.index}
            </span>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200 print:hidden">
          <span className="text-xs text-slate-500">
            Dapat dicetak untuk arsip fisik atau audit kas kantor.
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Transaksi</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Slip Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
