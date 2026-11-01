import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  SHEET_TABS_CONFIG,
  RAW_TABS_DATA,
  buildSheetTabInfo,
  computeTabPayload,
  categorizeDescription,
  extractRecipientOrSource,
} from '@/lib/finance-data';
import { FinanceApiResponse, SheetTabInfo, Transaction } from '@/types/finance';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DiscoveredTab {
  id: string;
  name: string;
  gid: string;
  monthLabel: string;
}

function deriveMonthLabel(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('juli')) return 'Juli 2026';
  if (lower.includes('agustus')) return 'Agustus 2026';
  if (lower.includes('september')) return 'September 2026';
  if (lower.includes('oktober')) return 'Oktober 2026';
  if (lower.includes('november')) return 'November 2026';
  if (lower.includes('desember')) return 'Desember 2026';
  if (lower.includes('januari')) return 'Januari 2027';
  if (lower.includes('februari')) return 'Februari 2027';
  if (lower.includes('maret')) return 'Maret 2027';
  if (lower.includes('april')) return 'April 2027';
  if (lower.includes('mei')) return 'Mei 2027';
  if (lower.includes('juni')) return 'Juni 2027';
  return name.replace(/^LAPKEU\s*/i, '');
}

function deriveTabId(name: string, gid: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('juli')) return 'juli';
  if (lower.includes('agustus')) return 'agustus';
  if (lower.includes('september')) return 'september';
  if (lower.includes('oktober')) return 'oktober';
  if (lower.includes('november')) return 'november';
  if (lower.includes('desember')) return 'desember';
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tab-${gid}`;
}

async function discoverGoogleSheetTabs(): Promise<DiscoveredTab[]> {
  try {
    const htmlUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/htmlview`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(htmlUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const regex = /name:\s*"([^"]+)",\s*pageUrl:[^}]*gid:\s*"(\d+)"/g;
      const matches = [...html.matchAll(regex)];

      if (matches.length > 0) {
        const found = matches.map((m) => {
          const name = m[1].trim();
          const gid = m[2].trim();
          return {
            id: deriveTabId(name, gid),
            name,
            gid,
            monthLabel: deriveMonthLabel(name),
          };
        });

        // Ensure all default tabs are present even if regex missed one
        SHEET_TABS_CONFIG.forEach((def) => {
          if (!found.some((f) => f.gid === def.gid)) {
            found.push({
              id: def.id,
              name: def.name,
              gid: def.gid,
              monthLabel: def.monthLabel,
            });
          }
        });

        return found;
      }
    }
  } catch (err) {
    console.warn('Dynamic Google Sheet tab discovery error, using base tabs:', err);
  }

  return SHEET_TABS_CONFIG.map((c) => ({
    id: c.id,
    name: c.name,
    gid: c.gid,
    monthLabel: c.monthLabel,
  }));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedTabId = url.searchParams.get('tab') || 'oktober';

  try {
    // 1. Dynamically discover all tabs currently in the Google Spreadsheet
    const discoveredConfigs = await discoverGoogleSheetTabs();

    // 2. Fetch each tab in parallel
    const fetchPromises = discoveredConfigs.map(async (cfg) => {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${cfg.gid}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(gvizUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'IsmayaPropertyFinanceBot/2.0',
          },
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const rawText = await res.text();
          const jsonStart = rawText.indexOf('{');
          const jsonEnd = rawText.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
            const rows = parsed?.table?.rows;

            if (Array.isArray(rows) && rows.length > 0) {
              let initialBalance = 0;
              let initialBalanceNote = '';
              const transactions: Transaction[] = [];

              for (let i = 0; i < rows.length; i++) {
                const c = rows[i]?.c;
                if (!c || !Array.isArray(c)) continue;

                const dateCell = c[0];
                const descCell = c[1];
                const debitCell = c[2];
                const kreditCell = c[3];
                const saldoCell = c[4];
                const fakturCell = c[5];

                const desc = descCell ? String(descCell.v ?? '').trim() : '';
                const dateStr = dateCell ? (dateCell.f ?? String(dateCell.v ?? '')) : '';

                if (!desc && !dateStr) continue;
                const descUpper = desc.toUpperCase();
                if (
                  descUpper.includes('TOTAL') ||
                  descUpper.includes('SISA UANG KAS BULAN') ||
                  descUpper.includes('KETERANGAN')
                ) {
                  continue;
                }

                // Check if row 0 or initial row is carry-over from previous month
                if (desc.toLowerCase().startsWith('sisa saldo bulan')) {
                  initialBalance =
                    saldoCell && typeof saldoCell.v === 'number'
                      ? saldoCell.v
                      : (saldoCell && typeof saldoCell.f === 'string'
                          ? parseInt(saldoCell.f.replace(/[^0-9]/g, ''), 10)
                          : 0);
                  initialBalanceNote = desc;
                  continue;
                }

                const debit = debitCell && typeof debitCell.v === 'number' ? debitCell.v : 0;
                const kredit = kreditCell && typeof kreditCell.v === 'number' ? kreditCell.v : 0;
                const saldo = saldoCell && typeof saldoCell.v === 'number' ? saldoCell.v : 0;
                const faktur = fakturCell ? String(fakturCell.v ?? '').trim() : 'Lihat Bukti Pembayaran';

                const isIncome = debit > 0;
                const cat = categorizeDescription(desc, isIncome);
                const voucherPrefix = isIncome ? 'BKM' : 'BKK';
                const monthCode = cfg.id.slice(0, 3).toUpperCase();
                const voucherNum = `${voucherPrefix}-2026${monthCode}-${String(transactions.length + 1).padStart(4, '0')}`;
                const recipient = extractRecipientOrSource(desc, isIncome);

                transactions.push({
                  id: `TX-${cfg.id}-${transactions.length + 1}`,
                  index: transactions.length + 1,
                  date: dateStr,
                  description: desc,
                  debit,
                  kredit,
                  saldo,
                  faktur,
                  category: cat.category,
                  type: isIncome ? 'debit' : 'kredit',
                  voucherNumber: voucherNum,
                  recipientOrSource: recipient,
                  tabId: cfg.id,
                });
              }

              if (transactions.length > 0) {
                const computed = computeTabPayload(
                  transactions,
                  initialBalance,
                  initialBalanceNote,
                  'live_googlesheet',
                  cfg.monthLabel
                );

                return {
                  id: cfg.id,
                  name: cfg.name,
                  gid: cfg.gid,
                  monthLabel: cfg.monthLabel,
                  initialBalance,
                  initialBalanceNote,
                  summary: computed.summary,
                  categories: computed.categories,
                  dailyTrend: computed.dailyTrend,
                  transactions,
                } as SheetTabInfo;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Failed live fetch for tab ${cfg.name}, using verified fallback:`, err);
      }

      // Fallback for this tab if predefined
      const raw = RAW_TABS_DATA[cfg.id] || { initialBalance: 0, initialBalanceNote: '', rows: [] };
      return buildSheetTabInfo(cfg.id, raw, 'cached_fallback');
    });

    const resolvedTabs = await Promise.all(fetchPromises);

    const activeTab =
      resolvedTabs.find((t) => t.id === requestedTabId) ||
      resolvedTabs.find((t) => t.id === 'oktober') ||
      resolvedTabs[0];

    const payload: FinanceApiResponse = {
      success: true,
      source: 'live_googlesheet',
      sheetTitle: 'LAPORAN KEUANGAN KANTOR - ISMAYA PROPERTY',
      sheetUrl: `${GOOGLE_SHEET_URL}&gid=${activeTab.gid}`,
      lastSyncedAt: new Date().toISOString(),
      activeTabId: activeTab.id,
      periodLabel: activeTab.monthLabel,
      summary: activeTab.summary,
      categories: activeTab.categories,
      dailyTrend: activeTab.dailyTrend,
      transactions: activeTab.transactions,
      tabs: resolvedTabs,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('Error in /api/finance multi-tab route:', err);
    // Return all tabs from verified cache
    const fallbackTabs = SHEET_TABS_CONFIG.map((cfg) => {
      const raw = RAW_TABS_DATA[cfg.id] || { initialBalance: 0, initialBalanceNote: '', rows: [] };
      return buildSheetTabInfo(cfg.id, raw, 'cached_fallback');
    });

    const activeTab = fallbackTabs.find((t) => t.id === requestedTabId) || fallbackTabs[0];

    return NextResponse.json({
      success: true,
      source: 'cached_fallback',
      sheetTitle: 'LAPORAN KEUANGAN KANTOR - ISMAYA PROPERTY',
      sheetUrl: `${GOOGLE_SHEET_URL}&gid=${activeTab.gid}`,
      lastSyncedAt: new Date().toISOString(),
      activeTabId: activeTab.id,
      periodLabel: activeTab.monthLabel,
      summary: activeTab.summary,
      categories: activeTab.categories,
      dailyTrend: activeTab.dailyTrend,
      transactions: activeTab.transactions,
      tabs: fallbackTabs,
    });
  }
}
