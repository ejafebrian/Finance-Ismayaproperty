export type TransactionType = 'debit' | 'kredit';
export type FinanceSource = 'live_googlesheet' | 'cached_fallback' | 'user_modified';

export interface Transaction {
  id: string;
  index: number;
  date: string;
  rawDate?: string;
  description: string;
  debit: number;
  kredit: number;
  saldo: number;
  faktur: string;
  category: string;
  type: TransactionType;
  voucherNumber: string;
  recipientOrSource: string;
  notes?: string;
  tabId?: string;
  isCustomAdded?: boolean;
  isModified?: boolean;
}

export interface TransactionFormData {
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  category: string;
  recipientOrSource: string;
  faktur: string;
  tabId?: string;
  notes?: string;
}

export interface CategorySummary {
  name: string;
  slug: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface DailyPoint {
  date: string;
  shortDate: string;
  debit: number;
  kredit: number;
  saldo: number;
}

export interface FinanceSummary {
  initialBalance: number;
  initialBalanceNote?: string;
  totalDebit: number;
  totalKredit: number;
  saldoAkhir: number;
  netCashFlow: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  largestExpense: {
    description: string;
    amount: number;
    date: string;
  };
  largestIncome: {
    description: string;
    amount: number;
    date: string;
  };
}

export interface SheetTabInfo {
  id: string;
  name: string;
  gid: string;
  monthLabel: string;
  initialBalance: number;
  initialBalanceNote?: string;
  summary: FinanceSummary;
  categories: CategorySummary[];
  dailyTrend: DailyPoint[];
  transactions: Transaction[];
  isLocallyModified?: boolean;
}

export interface MonthRecapRow {
  tabId: string;
  name: string;
  monthLabel: string;
  gid: string;
  initialBalance: number;
  initialBalanceNote: string;
  totalDebit: number;
  totalKredit: number;
  netCashFlow: number;
  endingBalance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  burnRatePercentage: number;
  status: 'surplus' | 'defisit' | 'seimbang';
  carryOverToNextMonth?: number;
  nextMonthName?: string;
}

export interface ConsolidatedRecap {
  months: MonthRecapRow[];
  totalCumulativeDebit: number;
  totalCumulativeKredit: number;
  currentEndingBalance: number;
  totalCumulativeTransactions: number;
  asOfTodayDate: string;
  asOfTodayTime?: string;
  asOfTodayFullStr?: string;
  lastRecordedDate: string;
  lastTransactionDescription: string;
}

export interface FinanceApiResponse {
  success: boolean;
  source: FinanceSource;
  sheetTitle: string;
  sheetUrl: string;
  lastSyncedAt: string;
  activeTabId: string;
  periodLabel: string;
  summary: FinanceSummary;
  categories: CategorySummary[];
  dailyTrend: DailyPoint[];
  transactions: Transaction[];
  tabs: SheetTabInfo[];
  isLocallyModified?: boolean;
  modifiedCount?: number;
  error?: string;
}
