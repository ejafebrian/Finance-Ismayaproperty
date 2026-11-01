'use client';

import React from 'react';
import { ConsolidatedRecap, FinanceApiResponse } from '@/types/finance';
import { formatRupiah, terbilangRupiah } from '@/lib/finance-data';

interface PrintableReportProps {
  data: FinanceApiResponse;
  recap?: ConsolidatedRecap;
}

export function PrintableReport({ data, recap }: PrintableReportProps) {
  const { summary, transactions, categories, periodLabel } = data;

  return (
    <div className="hidden print:block text-black bg-white p-6 max-w-4xl mx-auto text-xs leading-relaxed font-sans">
      
      {/* Official Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">
              ISMAYA PROPERTY
            </h1>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Laporan Keuangan & Rekapitulasi Kas Kantor Operasional
            </p>
            <p className="text-[11px] text-gray-600">
              Integrasi Data Resmi Google Sheets • Lembar Kerja: {data.tabs.find((t) => t.id === data.activeTabId)?.name || periodLabel}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block border border-black px-2.5 py-1 text-[11px] font-bold uppercase">
              Laporan Kas Resmi
            </span>
            <div className="text-[11px] text-gray-600 mt-1">
              Periode Aktif: <strong>{periodLabel}</strong>
            </div>
            <div className="text-[10px] text-gray-500">
              Posisi Kas Per: 30 Oktober 2026
            </div>
          </div>
        </div>
      </div>

      {/* POSISI KAS HARI INI & RINGKASAN EKSEKUTIF */}
      <div className="mb-6 p-4 border border-black bg-gray-50 rounded-lg">
        <h2 className="text-xs font-black uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
          I. Posisi Kas Kantor Per Hari Ini & Ringkasan {periodLabel}
        </h2>
        
        {recap && (
          <div className="mb-3 p-2.5 border border-black bg-white rounded flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600 block">
                Saldo Kas Riil Per Hari Ini ({recap.asOfTodayDate}):
              </span>
              <span className="text-base font-black text-black">
                {formatRupiah(recap.currentEndingBalance)}
              </span>
              <span className="text-[10px] text-gray-600 block italic">
                Terbilang: &ldquo;{terbilangRupiah(recap.currentEndingBalance)}&rdquo;
              </span>
            </div>
            <div className="text-right text-[10px] text-gray-500">
              <div>Total Transaksi 4 Bulan: <strong>{recap.totalCumulativeTransactions} Transaksi</strong></div>
              <div>Transaksi Terakhir: {recap.lastRecordedDate}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 border border-gray-300 bg-white">
            <span className="block text-[10px] uppercase text-gray-600 font-semibold">Total Pemasukan ({periodLabel})</span>
            <span className="font-extrabold text-sm">{formatRupiah(summary.totalDebit)}</span>
          </div>
          <div className="p-2 border border-gray-300 bg-white">
            <span className="block text-[10px] uppercase text-gray-600 font-semibold">Total Pengeluaran ({periodLabel})</span>
            <span className="font-extrabold text-sm">{formatRupiah(summary.totalKredit)}</span>
          </div>
          <div className="p-2 border border-black bg-gray-100 font-black">
            <span className="block text-[10px] uppercase text-gray-700 font-semibold">Saldo Akhir Bulan Ini</span>
            <span className="text-sm">{formatRupiah(summary.saldoAkhir)}</span>
          </div>
        </div>

        {summary.initialBalance > 0 && (
          <div className="mt-2 text-[10px] text-gray-700">
            *Saldo Awal Bulan Ini: <strong>{formatRupiah(summary.initialBalance)}</strong> ({summary.initialBalanceNote || 'Carry-over dari bulan sebelumnya'})
          </div>
        )}
      </div>

      {/* REKAPITULASI RANTAI SALDO BULAN SEBELUMNYA KE BULAN BERIKUTNYA */}
      {recap && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider mb-2">
            II. Rantai Saldo Kas: Bulan Sebelumnya $\rightarrow$ Bulan Berikutnya
          </h2>
          <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-400 font-bold">
                <th className="p-1.5 border-r border-gray-300">Bulan / TAB</th>
                <th className="p-1.5 border-r border-gray-300 text-right">Saldo Awal (Rp)</th>
                <th className="p-1.5 border-r border-gray-300 text-right">Masuk / Debit (Rp)</th>
                <th className="p-1.5 border-r border-gray-300 text-right">Keluar / Kredit (Rp)</th>
                <th className="p-1.5 border-r border-gray-300 text-right">Net Kas (Rp)</th>
                <th className="p-1.5 border-r border-gray-300 text-right">Saldo Akhir (Rp)</th>
                <th className="p-1.5 text-center">Status Aliran</th>
              </tr>
            </thead>
            <tbody>
              {recap.months.map((m) => (
                <tr key={m.tabId} className="border-b border-gray-200">
                  <td className="p-1.5 border-r border-gray-300 font-bold">{m.name}</td>
                  <td className="p-1.5 border-r border-gray-300 text-right font-mono">{formatRupiah(m.initialBalance)}</td>
                  <td className="p-1.5 border-r border-gray-300 text-right font-mono font-semibold">+{formatRupiah(m.totalDebit)}</td>
                  <td className="p-1.5 border-r border-gray-300 text-right font-mono font-semibold">-{formatRupiah(m.totalKredit)}</td>
                  <td className="p-1.5 border-r border-gray-300 text-right font-mono font-bold">
                    {m.netCashFlow >= 0 ? '+' : ''}{formatRupiah(m.netCashFlow)}
                  </td>
                  <td className="p-1.5 border-r border-gray-300 text-right font-mono font-extrabold">{formatRupiah(m.endingBalance)}</td>
                  <td className="p-1.5 text-center text-[9px]">
                    {m.nextMonthName ? `Dibawa ke ${m.nextMonthName}` : 'Posisi Per Hari Ini'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold border-t-2 border-black">
                <td className="p-1.5 border-r border-gray-300">Total Periode Juli-Okt</td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono">Rp 0</td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono">+{formatRupiah(recap.totalCumulativeDebit)}</td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono">-{formatRupiah(recap.totalCumulativeKredit)}</td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono">+{formatRupiah(recap.totalCumulativeDebit - recap.totalCumulativeKredit)}</td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono">{formatRupiah(recap.currentEndingBalance)}</td>
                <td className="p-1.5 text-center text-[9px]">Sisa Kas Hari Ini</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider mb-2">
          III. Rekapitulasi Beban Pengeluaran per Kategori ({periodLabel})
        </h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-[10px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-1.5 border-r border-gray-300">Kategori Beban</th>
              <th className="p-1.5 border-r border-gray-300 text-center">Jumlah Transaksi</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Total Nominal</th>
              <th className="p-1.5 text-right">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="p-1.5 border-r border-gray-300 font-semibold">{c.name}</td>
                <td className="p-1.5 border-r border-gray-300 text-center">{c.count}</td>
                <td className="p-1.5 border-r border-gray-300 text-right">{formatRupiah(c.total)}</td>
                <td className="p-1.5 text-right">{c.percentage}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="p-1.5 border-r border-gray-300">Total Pengeluaran Kas ({periodLabel})</td>
              <td className="p-1.5 border-r border-gray-300 text-center">{summary.expenseCount}</td>
              <td className="p-1.5 border-r border-gray-300 text-right">{formatRupiah(summary.totalKredit)}</td>
              <td className="p-1.5 text-right">100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Itemized Ledger Table */}
      <div className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider mb-2">
          IV. Rincian Buku Kas / Jurnal Transaksi ({periodLabel})
        </h2>
        <table className="w-full text-left border-collapse border border-gray-400 text-[9px]">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-400">
              <th className="p-1 border-r border-gray-300 text-center w-6">No</th>
              <th className="p-1 border-r border-gray-300 w-16">Tanggal</th>
              <th className="p-1 border-r border-gray-300 w-24">No. Bukti</th>
              <th className="p-1 border-r border-gray-300">Keterangan</th>
              <th className="p-1 border-r border-gray-300 text-right w-20">Debit (Rp)</th>
              <th className="p-1 border-r border-gray-300 text-right w-20">Kredit (Rp)</th>
              <th className="p-1 border-r border-gray-300 text-right w-20">Saldo (Rp)</th>
              <th className="p-1 text-center w-16">Faktur</th>
            </tr>
          </thead>
          <tbody>
            {summary.initialBalance > 0 && (
              <tr className="bg-gray-50 border-b border-gray-300 font-semibold">
                <td className="p-1 border-r border-gray-300 text-center">0</td>
                <td className="p-1 border-r border-gray-300">Awal Bulan</td>
                <td className="p-1 border-r border-gray-300 font-mono">SALDO-AWAL</td>
                <td className="p-1 border-r border-gray-300">{summary.initialBalanceNote || 'Sisa Saldo Kas Bulan Sebelumnya'}</td>
                <td className="p-1 border-r border-gray-300 text-right font-mono">-</td>
                <td className="p-1 border-r border-gray-300 text-right font-mono">-</td>
                <td className="p-1 border-r border-gray-300 text-right font-mono font-bold">{formatRupiah(summary.initialBalance)}</td>
                <td className="p-1 text-center">Bawaan</td>
              </tr>
            )}

            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-200">
                <td className="p-1 border-r border-gray-300 text-center">{tx.index}</td>
                <td className="p-1 border-r border-gray-300 whitespace-nowrap">{tx.date}</td>
                <td className="p-1 border-r border-gray-300 font-mono">{tx.voucherNumber}</td>
                <td className="p-1 border-r border-gray-300 font-medium">{tx.description}</td>
                <td className="p-1 border-r border-gray-300 text-right font-mono">
                  {tx.debit > 0 ? formatRupiah(tx.debit) : '-'}
                </td>
                <td className="p-1 border-r border-gray-300 text-right font-mono">
                  {tx.kredit > 0 ? formatRupiah(tx.kredit) : '-'}
                </td>
                <td className="p-1 border-r border-gray-300 text-right font-mono font-bold">
                  {formatRupiah(tx.saldo)}
                </td>
                <td className="p-1 text-center">{tx.faktur}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td colSpan={4} className="p-1.5 text-right uppercase">Total Bulan {periodLabel}:</td>
              <td className="p-1.5 border-r border-gray-300 text-right font-mono">{formatRupiah(summary.totalDebit)}</td>
              <td className="p-1.5 border-r border-gray-300 text-right font-mono">{formatRupiah(summary.totalKredit)}</td>
              <td className="p-1.5 border-r border-gray-300 text-right font-mono">{formatRupiah(summary.saldoAkhir)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Sign-off */}
      <div className="grid grid-cols-3 gap-6 pt-6 text-center text-[10px] border-t border-gray-300 page-break-inside-avoid">
        <div>
          <p className="font-semibold mb-14">Dibuat Oleh (Finance Kasir):</p>
          <p className="border-t border-gray-400 font-bold pt-1">Staff Keuangan</p>
          <p className="text-[9px] text-gray-500">ISMAYA PROPERTY</p>
        </div>
        <div>
          <p className="font-semibold mb-14">Diperiksa (Accounting Internal):</p>
          <p className="border-t border-gray-400 font-bold pt-1">Supervisor Pembukuan</p>
          <p className="text-[9px] text-gray-500">ISMAYA PROPERTY</p>
        </div>
        <div>
          <p className="font-semibold mb-14">Disetujui Oleh (Direksi):</p>
          <p className="border-t border-gray-400 font-bold pt-1">Direktur Utama</p>
          <p className="text-[9px] text-gray-500">ISMAYA PROPERTY</p>
        </div>
      </div>

    </div>
  );
}
