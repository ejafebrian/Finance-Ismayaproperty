'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { CategorySummary, DailyPoint } from '@/types/finance';
import { formatRupiah } from '@/lib/finance-data';

interface FinancialChartsProps {
  dailyTrend: DailyPoint[];
  categories: CategorySummary[];
  totalKredit: number;
  onSelectCategory?: (categoryName: string | null) => void;
  selectedCategory?: string | null;
}

export function FinancialCharts({
  dailyTrend,
  categories,
  totalKredit,
  onSelectCategory,
  selectedCategory,
}: FinancialChartsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DailyPoint | null>(null);

  // Calculate SVG dimensions for the Cash Flow Trend
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxSaldo = Math.max(...dailyTrend.map((d) => d.saldo), 14000000);
  const minSaldo = 0;

  const points = dailyTrend.map((d, i) => {
    const x = padding.left + (i / (dailyTrend.length - 1 || 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.saldo - minSaldo) / (maxSaldo - minSaldo)) * innerHeight;
    return { ...d, x, y };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, curr, i) => {
        if (i === 0) return `M ${curr.x} ${curr.y}`;
        // Simple smoothing bezier curve
        const prev = points[i - 1];
        const cx1 = prev.x + (curr.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (curr.x - prev.x) / 2;
        const cy2 = curr.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
      }, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
    : '';

  return (
    <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Cash Flow Trend & Saldo Curve (7 Cols) */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">
                Dinamika Saldo Kas & Arus Harian
              </h3>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Saldo Kas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/50"></span>
                Debit Masuk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/50"></span>
                Kredit Keluar
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Perkembangan saldo kas kumulatif serta volume penerimaan dan pengeluaran harian kantor sepanjang bulan Juli 2026.
          </p>
        </div>

        {/* SVG Cash Flow Graphic */}
        <div className="relative w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[500px] overflow-visible"
          >
            <defs>
              <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const val = minSaldo + (maxSaldo - minSaldo) * ratio;
              const y = padding.top + innerHeight - ratio * innerHeight;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {val === 0 ? 'Rp 0' : `${(val / 1000000).toFixed(0)} Jt`}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path d={areaD} fill="url(#balanceAreaGrad)" />

            {/* Daily volume bars */}
            {points.map((pt) => {
              const barWidth = 14;
              const barX = pt.x - barWidth / 2;
              const groundY = padding.top + innerHeight;
              
              // Scale bar heights relative to max single transaction
              const maxBarVal = 5000000;
              const debitH = Math.min((pt.debit / maxBarVal) * 50, 50);
              const kreditH = Math.min((pt.kredit / maxBarVal) * 50, 50);

              return (
                <g key={`bars-${pt.date}`}>
                  {pt.debit > 0 && (
                    <rect
                      x={barX}
                      y={groundY - debitH}
                      width={barWidth / 2}
                      height={debitH}
                      fill="#10b981"
                      fillOpacity="0.75"
                      rx="2"
                    />
                  )}
                  {pt.kredit > 0 && (
                    <rect
                      x={barX + barWidth / 2}
                      y={groundY - kreditH}
                      width={barWidth / 2}
                      height={kreditH}
                      fill="#f43f5e"
                      fillOpacity="0.75"
                      rx="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Saldo line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.date === pt.date ? 6 : 4}
                  fill="#0f172a"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  className="transition-all"
                />
                {/* Invisible hover target */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {/* X Axis labels */}
                <text
                  x={pt.x}
                  y={height - 12}
                  fill={hoveredPoint?.date === pt.date ? '#34d399' : '#94a3b8'}
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight={hoveredPoint?.date === pt.date ? '700' : '400'}
                >
                  {pt.shortDate}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Hover Card */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs pointer-events-none transition-all">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Tanggal: {hoveredPoint.date}
              </div>
              <div className="space-y-0.5 text-slate-300">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Saldo Akhir:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(hoveredPoint.saldo)}</span>
                </div>
                {hoveredPoint.debit > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Uang Masuk:</span>
                    <span className="font-semibold text-teal-400">+{formatRupiah(hoveredPoint.debit)}</span>
                  </div>
                )}
                {hoveredPoint.kredit > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Pengeluaran:</span>
                    <span className="font-semibold text-rose-400">-{formatRupiah(hoveredPoint.kredit)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer highlight */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Puncak Saldo: <strong className="text-emerald-300">Rp 13.275.000</strong> (29 Juli)</span>
          <span>Saldo Akhir Bulan: <strong className="text-emerald-400">{formatRupiah(points[points.length - 1]?.saldo || 8604000)}</strong></span>
        </div>
      </div>

      {/* Right Column: Expense Category Distribution (5 Cols) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">
                Komposisi Pengeluaran
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total {formatRupiah(totalKredit)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Alokasi kas keluar berdasarkan jenis kebutuhan kantor dan perumahan. Klik kategori untuk menyaring tabel kas.
          </p>
        </div>

        {/* Category list with visual progress bar */}
        <div className="space-y-3.5 my-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;

            return (
              <div
                key={cat.slug}
                onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat.name)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="font-semibold text-slate-200 truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                      {cat.count} tx
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-white">{formatRupiah(cat.total)}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5 font-medium">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category helper note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Pengeluaran terbesar pada operasional Cluster & Perlengkapan.</span>
          </div>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory && onSelectCategory(null)}
              className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

      </div>

    </section>
  );
}
