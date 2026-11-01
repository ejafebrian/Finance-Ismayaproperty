'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { ConsolidatedRecap } from '@/types/finance';
import {
  formatRupiah,
  terbilangRupiah,
  getIndonesianFullDateTime,
} from '@/lib/finance-data';

interface MonthlyRecapBridgeProps {
  recap: ConsolidatedRecap;
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onOpenAddModalToday: (dateStr?: string) => void;
}

export function MonthlyRecapBridge({
  recap,
  activeTabId,
  onSelectTab,
  onOpenAddModalToday,
}: MonthlyRecapBridgeProps) {
  const {
    months,
    totalCumulativeDebit,
    totalCumulativeKredit,
    currentEndingBalance,
    totalCumulativeTransactions,
    asOfTodayDate,
    lastRecordedDate,
  } = recap;

  // Real-time dynamic clock state synchronized with current local time
  const [liveTime, setLiveTime] = useState(() => getIndonesianFullDateTime(new Date()));

  useEffect(() => {
    // Ticking every 1 second
    const interval = setInterval(() => {
      setLiveTime(getIndonesianFullDateTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDateDisplay = liveTime ? `${liveTime.dayName}, ${liveTime.dateStr}` : asOfTodayDate;
  const currentTimeDisplay = liveTime ? `${liveTime.timeStr} ${liveTime.timeZoneStr}` : (recap.asOfTodayTime || 'WIB');

  return (
    <section className="mb-10 space-y-6">
      
      {/* 1. SECTION: POSISI SALDO KAS PER HARI INI DENGAN TANGGAL & JAM TERBARU */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 p-6 shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Info: Real-time Date, Clock, and Identity */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                POSISI KAS PER HARI INI
              </span>
              
              {/* Synchronized Date */}
              <span className="text-xs text-white font-semibold flex items-center gap-1.5 bg-slate-950/80 px-3.5 py-1 rounded-full border border-emerald-500/40 shadow">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentDateDisplay}</span>
              </span>

              {/* Synchronized Live Clock */}
              <span className="text-xs text-emerald-300 font-mono font-bold flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{currentTimeDisplay}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                Sinkron Waktu Nyata
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sisa Saldo Kas Kantor ISMAYA PROPERTY
            </h3>
            
            <p className="text-xs text-slate-300 max-w-xl">
              Akumulasi kas riil kantor hasil kesinambungan saldo bergulir dari seluruh lembar spreadsheet hingga per hari ini.
            </p>

            <div className="pt-1 text-xs text-emerald-300/90 italic">
              Terbilang:{' '}
              <span className="font-semibold text-white">&ldquo;{terbilangRupiah(currentEndingBalance)}&rdquo;</span>
            </div>
          </div>

          {/* Right Big Amount & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Saldo Kas Tersedia Saat Ini
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
                {formatRupiah(currentEndingBalance)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Transaksi Terakhir: <strong>{lastRecordedDate}</strong></span>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-4 flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenAddModalToday(liveTime?.dateStr)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Entri Kas Hari Ini</span>
              </button>

              <button
                onClick={() => {
                  const latestMonth = months[months.length - 1];
                  if (latestMonth) onSelectTab(latestMonth.tabId);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Buku Kas Terkini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: HITUNG & RANTAI SALDO BULAN SEBELUMNYA KE BULAN BERIKUTNYA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <PiggyBank className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">
                Rantai Saldo Kas: Bulan Sebelumnya $\rightarrow$ Bulan Berikutnya
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Menghitung kesinambungan saldo akhir bulan yang menjadi saldo awal (carry-over) pada lembar bulan berikutnya.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rantai Kas {months.length} Bulan Terhubung</span>
          </div>
        </div>

        {/* Visual Carry-over Chain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {months.map((m, idx) => {
            const isSelected = activeTabId === m.tabId;
            const isLastMonth = idx === months.length - 1;

            return (
              <div
                key={m.tabId}
                onClick={() => onSelectTab(m.tabId)}
                className={`relative rounded-2xl p-4.5 transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800/80'
                }`}
              >
                {/* Header Month Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-sm text-white flex items-center gap-1.5 truncate">
                      <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{m.name}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isLastMonth
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isLastMonth ? 'Bulan Berjalan' : `${m.transactionCount} Transaksi`}
                    </span>
                  </div>

                  {/* Saldo Awal */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 mb-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                      Saldo Awal ({m.initialBalanceNote}):
                    </span>
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {formatRupiah(m.initialBalance)}
                    </span>
                  </div>

                  {/* Arus Kas Bulan Ini */}
                  <div className="space-y-1.5 py-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        Pemasukan (Debit):
                      </span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        +{formatRupiah(m.totalDebit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <ArrowDownRight className="w-3 h-3 text-rose-400" />
                        Pengeluaran (Kredit):
                      </span>
                      <span className="font-mono text-rose-400 font-semibold">
                        -{formatRupiah(m.totalKredit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">Net Arus Kas:</span>
                      <span
                        className={`font-mono font-bold ${
                          m.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.netCashFlow >= 0 ? '+' : ''}
                        {formatRupiah(m.netCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saldo Akhir & Carry-Over Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Saldo Akhir Kas:
                    </span>
                    <span className="text-sm font-extrabold text-emerald-300 font-mono">
                      {formatRupiah(m.endingBalance)}
                    </span>
                  </div>

                  {m.carryOverToNextMonth !== undefined && m.nextMonthName ? (
                    <div className="mt-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2 text-[10px] text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold truncate">
                        <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Dibawa ke {m.nextMonthName}:</span>
                      </span>
                      <span className="font-mono font-bold shrink-0">{formatRupiah(m.carryOverToNextMonth)}</span>
                    </div>
                  ) : (
                    <div className="mt-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-emerald-300 flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Posisi Kas Terkini</span>
                      <span className="font-mono font-bold text-emerald-400">Per Hari Ini</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: TABEL REKAPITULASI KOMPARATIF SEMUA BULAN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Tabel Rekapitulasi Kas Seluruh Bulan ({months.length} Lembar TAB)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rangkuman lengkap arus kas, saldo awal, serapan belanja, dan saldo akhir tiap lembar kerja spreadsheet.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            Total {totalCumulativeTransactions} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Lembar / TAB</th>
                <th className="py-3 px-4 text-right">Saldo Awal (Rp)</th>
                <th className="py-3 px-4 text-right">Pemasukan Debit (Rp)</th>
                <th className="py-3 px-4 text-right">Pengeluaran Kredit (Rp)</th>
                <th className="py-3 px-4 text-right">Net Kas (Rp)</th>
                <th className="py-3 px-4 text-right">Saldo Akhir Kas (Rp)</th>
                <th className="py-3 px-4 text-center">Status Arus</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {months.map((m) => (
                <tr
                  key={m.tabId}
                  className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    activeTabId === m.tabId ? 'bg-slate-800/25' : ''
                  }`}
                  onClick={() => onSelectTab(m.tabId)}
                >
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">{m.name}</span>
                      {activeTabId === m.tabId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Aktif
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">{m.monthLabel}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {formatRupiah(m.initialBalance)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    +{formatRupiah(m.totalDebit)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400">
                    -{formatRupiah(m.totalKredit)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={m.netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-400'}>
                      {m.netCashFlow >= 0 ? '+' : ''}
                      {formatRupiah(m.netCashFlow)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white text-sm">
                    {formatRupiah(m.endingBalance)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'surplus'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {m.status === 'surplus' ? 'Surplus' : 'Defisit Kas'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTab(m.tabId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      Buka
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-white text-xs">
              <tr>
                <td className="py-4 px-4 uppercase text-slate-400">
                  Konsolidasi Total Seluruh Tab:
                </td>
                <td className="py-4 px-4 text-right font-mono text-slate-400">
                  Rp 0 (Awal)
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-400 text-sm">
                  +{formatRupiah(totalCumulativeDebit)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-rose-400 text-sm">
                  -{formatRupiah(totalCumulativeKredit)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-300 text-sm">
                  +{formatRupiah(totalCumulativeDebit - totalCumulativeKredit)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-400 text-base font-black">
                  {formatRupiah(currentEndingBalance)}
                </td>
                <td colSpan={2} className="py-4 px-4 text-center text-slate-400 text-[11px] font-semibold">
                  Saldo Kas Per Hari Ini
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </section>
  );
}
