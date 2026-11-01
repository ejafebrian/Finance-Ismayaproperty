'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PiggyBank,
} from 'lucide-react';
import { FinanceSummary } from '@/types/finance';
import { formatRupiah } from '@/lib/finance-data';

interface ExecutiveMetricsProps {
  summary: FinanceSummary;
  periodLabel?: string;
  tabName?: string;
}

export function ExecutiveMetrics({ summary, periodLabel = 'Oktober 2026', tabName = 'LAPKEU OKTOBER' }: ExecutiveMetricsProps) {
  const effectiveInflow = (summary.initialBalance || 0) + summary.totalDebit;
  const expenseRatio = effectiveInflow > 0
    ? ((summary.totalKredit / effectiveInflow) * 100).toFixed(1)
    : '0';

  const retentionRatio = effectiveInflow > 0
    ? ((summary.saldoAkhir / effectiveInflow) * 100).toFixed(1)
    : '0';

  const isReconciled =
    (summary.initialBalance || 0) + summary.totalDebit - summary.totalKredit === summary.saldoAkhir;

  return (
    <section className="mb-8">
      {/* Financial Health Banner */}
      <div className="mb-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Laporan Kas Kantor ISMAYA PROPERTY • <span className="text-emerald-400 font-extrabold">{tabName}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Status: Likuid & Terverifikasi
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Buku kas kantor periode <strong className="text-slate-200">{periodLabel}</strong>. Mengintegrasikan seluruh pencatatan transaksi masuk, beban proyek properti, notaris/pajak, dan operasional kantor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Transaksi</span>
            <span className="text-white font-bold text-sm">{summary.transactionCount} Catatan</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Rekonsiliasi</span>
            <span className={`font-bold text-sm ${isReconciled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isReconciled ? '100% Klop' : 'Perlu Penyesuaian'}
            </span>
          </div>
        </div>
      </div>

      {/* Saldo Awal Callout if present */}
      {summary.initialBalance > 0 && (
        <div className="mb-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2 font-medium">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <span>
              Saldo Kas Awal Bulan ({summary.initialBalanceNote || 'Bawaan Bulan Sebelumnya'}):
            </span>
          </div>
          <span className="font-mono font-black text-sm text-emerald-200">
            {formatRupiah(summary.initialBalance)}
          </span>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Debit / Uang Masuk */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/90 p-5 shadow-lg transition-all hover:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Masuk (Debit)
              </span>
              <div className="mt-2 text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {formatRupiah(summary.totalDebit)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {summary.incomeCount} Transaksi Masuk
            </span>
            <span className="text-slate-500 font-mono">Bulan {periodLabel}</span>
          </div>
        </div>

        {/* Card 2: Total Kredit / Pengeluaran */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/90 p-5 shadow-lg transition-all hover:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Keluar (Kredit)
              </span>
              <div className="mt-2 text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {formatRupiah(summary.totalKredit)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {summary.expenseCount} Transaksi Keluar
            </span>
            <span className="text-slate-400 font-medium">Serapan {expenseRatio}%</span>
          </div>
        </div>

        {/* Card 3: Saldo Akhir Kas */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 p-5 shadow-xl shadow-emerald-950/20">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Sisa Saldo Kas Kantor
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="mt-2 text-2xl lg:text-3xl font-black text-emerald-300 tracking-tight">
                {formatRupiah(summary.saldoAkhir)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              Kas Tersedia: {retentionRatio}%
            </span>
            <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono text-[11px]">
              Posisi Kas Aktif
            </span>
          </div>
        </div>

        {/* Card 4: Pengeluaran Terbesar */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/90 p-5 shadow-lg transition-all hover:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300"></div>
          <div className="flex items-start justify-between">
            <div className="max-w-[75%]">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pengeluaran Terbesar
              </span>
              <div className="mt-2 text-xl font-bold text-white tracking-tight truncate">
                {formatRupiah(summary.largestExpense.amount)}
              </div>
              <p className="text-[11px] text-amber-300/90 truncate mt-0.5">
                {summary.largestExpense.description}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Tgl: {summary.largestExpense.date}
            </span>
            <span className="text-amber-400 font-semibold text-[11px]">Audit Kas</span>
          </div>
        </div>

      </div>
    </section>
  );
}
