import {
  CategorySummary,
  DailyPoint,
  FinanceApiResponse,
  FinanceSource,
  FinanceSummary,
  MonthRecapRow,
  ConsolidatedRecap,
  SheetTabInfo,
  Transaction,
} from '@/types/finance';

export const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1GZYsck5hxGy9nG1X5Dxm8rBHZEW_nKZjH5UlsZnOH7I/edit?usp=drivesdk';
export const GOOGLE_SHEET_ID = '1GZYsck5hxGy9nG1X5Dxm8rBHZEW_nKZjH5UlsZnOH7I';

export const SHEET_TABS_CONFIG = [
  { id: 'oktober', name: 'LAPKEU OKTOBER', gid: '663304332', monthLabel: 'Oktober 2026', defaultDate: '20 October 2026' },
  { id: 'september', name: 'LAPKEU SEPTEMBER', gid: '1130244104', monthLabel: 'September 2026', defaultDate: '28 September 2026' },
  { id: 'agustus', name: 'LAPKEU AGUSTUS', gid: '1310990453', monthLabel: 'Agustus 2026', defaultDate: '30 August 2026' },
  { id: 'juli', name: 'LAPKEU JULI', gid: '0', monthLabel: 'Juli 2026', defaultDate: '31 July 2026' },
];

export const PROPERTY_OFFICE_CATEGORIES = [
  { name: 'Kas & Modal Masuk', color: '#10b981', defaultType: 'debit' },
  { name: 'Perlengkapan Properti & Cluster', color: '#f59e0b', defaultType: 'kredit' },
  { name: 'Pajak, Notaris & Legalitas', color: '#6366f1', defaultType: 'kredit' },
  { name: 'Operasional & ATK Kantor', color: '#3b82f6', defaultType: 'kredit' },
  { name: 'Transfer Manajemen & Direksi', color: '#8b5cf6', defaultType: 'kredit' },
  { name: 'Personalia, Gaji & Kasbon', color: '#14b8a6', defaultType: 'kredit' },
  { name: 'Iuran & Lingkungan Kavling', color: '#06b6d4', defaultType: 'kredit' },
  { name: 'Sosial & Kerohiman', color: '#eab308', defaultType: 'kredit' },
  { name: 'Payment Sample & Bisnis', color: '#ec4899', defaultType: 'kredit' },
  { name: 'Kesehatan & Operasional Khusus', color: '#ef4444', defaultType: 'kredit' },
  { name: 'Transportasi & Kurir', color: '#64748b', defaultType: 'kredit' },
  { name: 'Pengeluaran Lainnya', color: '#94a3b8', defaultType: 'kredit' },
];

export const RECEIPT_STATUS_OPTIONS = [
  'Lihat Bukti Pembayaran',
  'Lihat',
  'CASH',
  'Kuitansi Fisik',
  'Nota Toko / Vendor',
  'Bukti Transfer Bank',
  'Ambil dari KAS Kantor',
  'OVO',
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, ' ');
}

export function formatNumberIndonesian(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function terbilangRupiah(n: number): string {
  if (n === 0) return 'Nol Rupiah';

  const angka = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas',
  ];

  function convert(x: number): string {
    if (x < 12) {
      return angka[x];
    } else if (x < 20) {
      return convert(x - 10) + ' Belas';
    } else if (x < 100) {
      return convert(Math.floor(x / 10)) + ' Puluh ' + convert(x % 10);
    } else if (x < 200) {
      return 'Seratus ' + convert(x - 100);
    } else if (x < 1000) {
      return convert(Math.floor(x / 100)) + ' Ratus ' + convert(x % 100);
    } else if (x < 2000) {
      return 'Seribu ' + convert(x - 1000);
    } else if (x < 1000000) {
      return convert(Math.floor(x / 1000)) + ' Ribu ' + convert(x % 1000);
    } else if (x < 1000000000) {
      return convert(Math.floor(x / 1000000)) + ' Juta ' + convert(x % 1000000);
    } else if (x < 1000000000000) {
      return convert(Math.floor(x / 1000000000)) + ' Miliar ' + convert(x % 1000000000);
    }
    return '';
  }

  const result = convert(Math.floor(Math.abs(n))).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}

export function categorizeDescription(
  desc: string,
  isIncome: boolean
): { category: string; color: string } {
  if (isIncome) {
    return { category: 'Kas & Modal Masuk', color: '#10b981' };
  }

  const lower = desc.toLowerCase();

  if (lower.includes('pbb') || lower.includes('pajak') || lower.includes('notaris') || lower.includes('sertifikat') || lower.includes('unblock pt')) {
    return { category: 'Pajak, Notaris & Legalitas', color: '#6366f1' };
  }

  if (lower.includes('gaji') || lower.includes('kasbon') || lower.includes('resty')) {
    return { category: 'Personalia, Gaji & Kasbon', color: '#14b8a6' };
  }

  if (lower.includes('kerohiman') || lower.includes('sedekah') || lower.includes('rokok tukang')) {
    return { category: 'Sosial & Kerohiman', color: '#eab308' };
  }

  if (lower.includes('tangga') || lower.includes('mesin air') || lower.includes('lampu') || lower.includes('bohlam') || lower.includes('tukang') || lower.includes('puing') || lower.includes('cluster') || lower.includes('percetakan') || lower.includes('toren')) {
    return { category: 'Perlengkapan Properti & Cluster', color: '#f59e0b' };
  }

  if (lower.includes('kebersihan') || lower.includes('keamanan') || lower.includes('kav a1') || lower.includes('iuran')) {
    return { category: 'Iuran & Lingkungan Kavling', color: '#06b6d4' };
  }

  if (lower.includes('pak kukuh') || lower.includes('bu iweng') || lower.includes('pak agung') || lower.includes('alvi')) {
    return { category: 'Transfer Manajemen & Direksi', color: '#8b5cf6' };
  }

  if (lower.includes('token') || lower.includes('listrik') || lower.includes('tinta') || lower.includes('printer') || lower.includes('service') || lower.includes('materai') || lower.includes('kwitansi') || lower.includes('fc surat')) {
    return { category: 'Operasional & ATK Kantor', color: '#3b82f6' };
  }

  if (lower.includes('grabcar') || lower.includes('parkir') || lower.includes('gosend')) {
    return { category: 'Transportasi & Kurir', color: '#64748b' };
  }

  if (lower.includes('kratom') || lower.includes('sample')) {
    return { category: 'Payment Sample & Bisnis', color: '#ec4899' };
  }

  if (lower.includes('obat') || lower.includes('nenek') || lower.includes('buah') || lower.includes('medis')) {
    return { category: 'Kesehatan & Operasional Khusus', color: '#ef4444' };
  }

  return { category: 'Pengeluaran Lainnya', color: '#94a3b8' };
}

export function extractRecipientOrSource(desc: string, isIncome: boolean): string {
  if (isIncome) {
    return 'Kas Masuk Kantor / Bank';
  }
  const lower = desc.toLowerCase();
  if (lower.includes('pak kukuh')) return 'Pak Kukuh';
  if (lower.includes('bu iweng')) return 'Bu Iweng';
  if (lower.includes('pak agung')) return 'Pak Agung';
  if (lower.includes('bu erna')) return 'Bu Erna';
  if (lower.includes('resty')) return 'Resty';
  if (lower.includes('pak aris')) return 'Pak Aris (Marketing)';
  if (lower.includes('pak erwin')) return 'Pak Erwin (Sertifikat)';
  if (lower.includes('hambit') || lower.includes('notaris')) return 'Kantor Notaris';
  if (lower.includes('novrizal')) return 'Novrizal (Sample)';
  if (lower.includes('novian')) return 'Novian Darmawan (Sample)';
  if (lower.includes('kav a1')) return 'Pengelola Lingkungan Kav. A1';
  if (lower.includes('tukang')) return 'Mandor / Tukang Properti';
  if (lower.includes('pbb')) return 'Kantor Pajak Daerah (PBB)';
  if (lower.includes('token') || lower.includes('listrik')) return 'PLN';
  return 'Operasional Kantor';
}

// Fallback seed for all 4 Google Sheet tabs
export const RAW_TABS_DATA: Record<string, { initialBalance: number; initialBalanceNote: string; rows: Array<{ date: string; desc: string; debit: number; kredit: number; saldo: number; faktur: string }> }> = {
  juli: {
    initialBalance: 0,
    initialBalanceNote: 'Saldo Awal Pembukuan',
    rows: [
      { date: '13 July 2026', desc: 'Uang Masuk', debit: 3000000, kredit: 0, saldo: 3000000, faktur: 'Lihat' },
      { date: '13 July 2026', desc: 'Pembayaran Iuran kebersihan Kav A1 cemput', debit: 0, kredit: 50000, saldo: 2950000, faktur: 'CASH' },
      { date: '14 July 2026', desc: 'Beli lampu rumah percetakan (11 buah)', debit: 0, kredit: 305000, saldo: 2645000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '15 July 2026', desc: 'Beli tinta printer kantor 1 set (4 botol)', debit: 0, kredit: 100000, saldo: 2545000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '17 July 2026', desc: 'Service printer kantor', debit: 0, kredit: 120000, saldo: 2425000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '20 July 2026', desc: 'Uang Masuk', debit: 5000000, kredit: 0, saldo: 7425000, faktur: 'Lihat' },
      { date: '20 July 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 6425000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '21 July 2026', desc: 'Uang Masuk', debit: 2250000, kredit: 0, saldo: 8675000, faktur: 'Lihat' },
      { date: '24 July 2026', desc: 'Payment sample kratom a/n Novrizal', debit: 0, kredit: 100000, saldo: 8575000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 July 2026', desc: 'Payment sample kratom a/n Novian Darmawan', debit: 0, kredit: 300000, saldo: 8275000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '29 July 2026', desc: 'Uang Masuk', debit: 5000000, kredit: 0, saldo: 13275000, faktur: 'Lihat' },
      { date: '29 July 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 12275000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '30 July 2026', desc: 'Payment obat ibu + kirim jkt', debit: 0, kredit: 760000, saldo: 11515000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '30 July 2026', desc: 'Pembelian Tangga cluster Percetakan Negara', debit: 0, kredit: 2350000, saldo: 9165000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '31 July 2026', desc: 'Pembelian Materai 10.000 (5 lbr)', debit: 0, kredit: 61000, saldo: 9104000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '31 July 2026', desc: 'Transfer Bu Iweng', debit: 0, kredit: 500000, saldo: 8604000, faktur: 'Lihat Bukti Pembayaran' },
    ],
  },
  agustus: {
    initialBalance: 8604000,
    initialBalanceNote: 'Sisa Saldo bulan juli',
    rows: [
      { date: '2 August 2026', desc: 'Pembayaran Iuran keamanan Kav A1 cemput (juli agustus)', debit: 0, kredit: 60000, saldo: 8544000, faktur: 'CASH' },
      { date: '3 August 2026', desc: 'Pembayaran Iuran kebersihan Kav A1 cemput', debit: 0, kredit: 50000, saldo: 8494000, faktur: 'CASH' },
      { date: '7 August 2026', desc: 'Pembelian token listrik kantor', debit: 0, kredit: 53000, saldo: 8441000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Print Kwitansi', debit: 0, kredit: 2000, saldo: 8439000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Uang Masuk', debit: 10000000, kredit: 0, saldo: 18441000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Transfer Pak Agung', debit: 0, kredit: 1500000, saldo: 16941000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Transfer Bu Iweng', debit: 0, kredit: 1500000, saldo: 15441000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Transfer Kerohiman Bu Erna', debit: 0, kredit: 4002500, saldo: 11438500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '7 August 2026', desc: 'Gaji Resty', debit: 0, kredit: 3000000, saldo: 8438500, faktur: 'Ibu tfr ke rek Resty' },
      { date: '14 August 2026', desc: 'Pembayaran DP Tukang', debit: 0, kredit: 3000000, saldo: 5438500, faktur: 'CASH' },
      { date: '14 August 2026', desc: 'Uang Masuk', debit: 10000000, kredit: 0, saldo: 15438500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '14 August 2026', desc: 'Pembelian Mesin Air', debit: 0, kredit: 2388000, saldo: 13050500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '15 August 2026', desc: 'Pembelian bohlam 9 bh', debit: 0, kredit: 190000, saldo: 12860500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '18 August 2026', desc: 'Pembelian Token listrik rumah percetakan', debit: 0, kredit: 22500, saldo: 12838000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '20 August 2026', desc: 'Pembayaran Print bukti TF dana masuk ke tanah Utan Kayu', debit: 0, kredit: 99000, saldo: 12739000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '20 August 2026', desc: 'Pembayaran pelunasan Tukang+Material mesin air+pembuangan puing', debit: 0, kredit: 2850000, saldo: 9889000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '20 August 2026', desc: 'Parkir MKG 3 ketemu ibu', debit: 0, kredit: 5000, saldo: 9884000, faktur: 'CASH' },
      { date: '20 August 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 8884000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '20 August 2026', desc: 'Resty Kasbon', debit: 0, kredit: 2000000, saldo: 6884000, faktur: 'Ambil dari Kas Kantor' },
      { date: '21 August 2026', desc: 'Pembelian buah bu erna', debit: 0, kredit: 220000, saldo: 6664000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '23 August 2026', desc: 'Transfer uang rokok tukang gareng', debit: 0, kredit: 300000, saldo: 6364000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '24 August 2026', desc: 'Gosend Obat Nenek (ibunya bu Nofy)', debit: 0, kredit: 14000, saldo: 6350000, faktur: 'OVO' },
      { date: '30 August 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 5350000, faktur: 'Lihat Bukti Pembayaran' },
    ],
  },
  september: {
    initialBalance: 5350000,
    initialBalanceNote: 'Sisa Saldo bulan Agustus',
    rows: [
      { date: '2 September 2026', desc: 'Pembayaran Awal Unblock PT Ekspor di Not Hambit', debit: 0, kredit: 1000000, saldo: 4350000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '3 September 2026', desc: 'Pembayaran Iuran kebersihan Kav A1 cemput', debit: 0, kredit: 50000, saldo: 4300000, faktur: 'CASH' },
      { date: '5 September 2026', desc: 'Grabcar Utan kayu-Pakubuwono (bu erna)', debit: 0, kredit: 87000, saldo: 4213000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '6 September 2026', desc: 'Uang Masuk', debit: 3000000, kredit: 0, saldo: 7213000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '6 September 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 6213000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '6 September 2026', desc: 'Transfer Bu Iweng', debit: 0, kredit: 1500000, saldo: 4713000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '6 September 2026', desc: 'Transfer Alvi', debit: 0, kredit: 202500, saldo: 4510500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '9 September 2026', desc: 'Uang Masuk', debit: 10000000, kredit: 0, saldo: 14510500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '9 September 2026', desc: 'Transfer Uang sedekah ke rek Kak Yeni', debit: 0, kredit: 2002500, saldo: 12508000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '10 September 2026', desc: 'Transfer Pak Agung', debit: 0, kredit: 1000000, saldo: 11508000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '10 September 2026', desc: 'Transfer 2jt + cash 2 jt uang kerohiman bu erna', debit: 0, kredit: 4000000, saldo: 7508000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '10 September 2026', desc: 'Gaji Resty', debit: 0, kredit: 2000000, saldo: 5508000, faktur: 'Ambil dari KAS kantor' },
      { date: '13 September 2026', desc: 'Pembayaran Tukang Listrik (tf via rek pak aris marketing)', debit: 0, kredit: 502500, saldo: 5005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '13 September 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 4005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '21 September 2026', desc: 'Uang Masuk', debit: 5000000, kredit: 0, saldo: 9005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '21 September 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 8005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '23 September 2026', desc: 'Pembayaran 2 sertifikat di pak Erwin', debit: 0, kredit: 3000000, saldo: 5005500, faktur: 'CASH' },
      { date: '28 September 2026', desc: 'Uang Masuk', debit: 10000000, kredit: 0, saldo: 15005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 September 2026', desc: 'Transfer Pak Kukuh', debit: 0, kredit: 1000000, saldo: 14005500, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 September 2026', desc: 'Pembayaran Fee marketing pak aris', debit: 0, kredit: 7402500, saldo: 6603000, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 September 2026', desc: 'Pembayaran tunggakan PBB indra halim 2024', debit: 0, kredit: 895944, saldo: 5707056, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 September 2026', desc: 'Pembayaran tunggakan PBB indra halim 2025', debit: 0, kredit: 1342665, saldo: 4364391, faktur: 'Lihat Bukti Pembayaran' },
      { date: '28 September 2026', desc: 'Pembayaran tunggakan PBB indra halim 2026', debit: 0, kredit: 1409674, saldo: 2954717, faktur: 'Lihat Bukti Pembayaran' },
    ],
  },
  oktober: {
    initialBalance: 2954717,
    initialBalanceNote: 'Sisa Saldo bulan September',
    rows: [
      { date: '2 October 2026', desc: 'Uang masuk', debit: 10000000, kredit: 0, saldo: 12954717, faktur: 'Lihat Bukti Pembayaran' },
      { date: '2 October 2026', desc: 'Pembayaran Pajak Penjual rumah bu Inaz ke Notaris', debit: 0, kredit: 8908650, saldo: 4046067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '4 October 2026', desc: 'Pembayaran Iuran Keamanan kav A1 (kantor cemput)', debit: 0, kredit: 30000, saldo: 4016067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '4 October 2026', desc: 'Pembayaran Iuran kebersihan kav A1 (kantor cemput)', debit: 0, kredit: 50000, saldo: 3966067, faktur: 'CASH' },
      { date: '4 October 2026', desc: 'Isi token listrik kantor', debit: 0, kredit: 52500, saldo: 3913567, faktur: 'Lihat Bukti Pembayaran' },
      { date: '5 October 2026', desc: 'Uang masuk', debit: 10000000, kredit: 0, saldo: 13913567, faktur: 'Lihat Bukti Pembayaran' },
      { date: '5 October 2026', desc: 'Transfer pak Kukuh', debit: 0, kredit: 1000000, saldo: 12913567, faktur: 'Lihat Bukti Pembayaran' },
      { date: '5 October 2026', desc: 'Transfer bu Iweng', debit: 0, kredit: 2000000, saldo: 10913567, faktur: 'Lihat Bukti Pembayaran' },
      { date: '5 October 2026', desc: 'Transfer Kerohiman bu Erna', debit: 0, kredit: 4002500, saldo: 6911067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '5 October 2026', desc: 'Gaji Resty', debit: 0, kredit: 2000000, saldo: 4911067, faktur: 'Ambil dari KAS Kantor' },
      { date: '12 October 2026', desc: 'Transfer pak Kukuh', debit: 0, kredit: 1000000, saldo: 3911067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '13 October 2026', desc: 'Transfer pak Agung', debit: 0, kredit: 1000000, saldo: 2911067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '15 October 2026', desc: 'Pembayaran jasa tukang bersihkan toren rumah bu Inaz', debit: 0, kredit: 136000, saldo: 2775067, faktur: 'Lihat Bukti Pembayaran' },
      { date: '15 October 2026', desc: 'Fc surat + map surat', debit: 0, kredit: 9000, saldo: 2766067, faktur: 'CASH' },
      { date: '20 October 2026', desc: 'Transfer pak Kukuh', debit: 0, kredit: 1000000, saldo: 1766067, faktur: 'Lihat Bukti Pembayaran' },
    ],
  },
};

export function buildSheetTabInfo(
  tabId: string,
  rawTab: { initialBalance: number; initialBalanceNote: string; rows: Array<{ date: string; desc: string; debit: number; kredit: number; saldo: number; faktur: string }> },
  source: FinanceSource = 'cached_fallback'
): SheetTabInfo {
  const cfg = SHEET_TABS_CONFIG.find((c) => c.id === tabId) || {
    id: tabId,
    name: `LAPKEU ${tabId.toUpperCase()}`,
    gid: '0',
    monthLabel: tabId.toUpperCase(),
  };

  let runningSaldo = rawTab.initialBalance;

  const transactions: Transaction[] = rawTab.rows.map((item, idx) => {
    const isIncome = item.debit > 0;
    const cat = categorizeDescription(item.desc, isIncome);
    const voucherPrefix = isIncome ? 'BKM' : 'BKK';
    const monthCode = tabId.slice(0, 3).toUpperCase();
    const voucherNum = `${voucherPrefix}-2026${monthCode}-${String(idx + 1).padStart(4, '0')}`;
    const recipient = extractRecipientOrSource(item.desc, isIncome);

    runningSaldo = runningSaldo + (item.debit || 0) - (item.kredit || 0);

    return {
      id: `TX-${tabId}-${idx + 1}`,
      index: idx + 1,
      date: item.date,
      description: item.desc,
      debit: item.debit,
      kredit: item.kredit,
      saldo: item.saldo || runningSaldo,
      faktur: item.faktur || 'Lihat Bukti Pembayaran',
      category: cat.category,
      type: isIncome ? 'debit' : 'kredit',
      voucherNumber: voucherNum,
      recipientOrSource: recipient,
      tabId,
    };
  });

  const payload = computeTabPayload(
    transactions,
    rawTab.initialBalance,
    rawTab.initialBalanceNote,
    source,
    cfg.monthLabel
  );

  return {
    id: tabId,
    name: cfg.name,
    gid: cfg.gid,
    monthLabel: cfg.monthLabel,
    initialBalance: rawTab.initialBalance,
    initialBalanceNote: rawTab.initialBalanceNote,
    summary: payload.summary,
    categories: payload.categories,
    dailyTrend: payload.dailyTrend,
    transactions,
  };
}

export function buildFallbackData(activeTabId: string = 'oktober'): FinanceApiResponse {
  const tabs: SheetTabInfo[] = SHEET_TABS_CONFIG.map((cfg) => {
    const raw = RAW_TABS_DATA[cfg.id] || { initialBalance: 0, initialBalanceNote: '', rows: [] };
    return buildSheetTabInfo(cfg.id, raw, 'cached_fallback');
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return {
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
    tabs,
  };
}

export function computeTabPayload(
  transactions: Transaction[],
  initialBalance: number = 0,
  initialBalanceNote?: string,
  source: FinanceSource = 'cached_fallback',
  monthLabel: string = 'Oktober 2026'
): { summary: FinanceSummary; categories: CategorySummary[]; dailyTrend: DailyPoint[] } {
  let totalDebit = 0;
  let totalKredit = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  let largestExpense = { description: '-', amount: 0, date: '-' };
  let largestIncome = { description: '-', amount: 0, date: '-' };

  const categoryMap = new Map<string, { total: number; count: number; color: string }>();
  const dailyMap = new Map<string, { debit: number; kredit: number; saldo: number; date: string }>();

  transactions.forEach((tx) => {
    totalDebit += tx.debit;
    totalKredit += tx.kredit;

    if (tx.type === 'debit') {
      incomeCount++;
      if (tx.debit > largestIncome.amount) {
        largestIncome = { description: tx.description, amount: tx.debit, date: tx.date };
      }
    } else {
      expenseCount++;
      if (tx.kredit > largestExpense.amount) {
        largestExpense = { description: tx.description, amount: tx.kredit, date: tx.date };
      }

      const current = categoryMap.get(tx.category) || {
        total: 0,
        count: 0,
        color: categorizeDescription(tx.description, false).color,
      };
      current.total += tx.kredit;
      current.count += 1;
      categoryMap.set(tx.category, current);
    }

    const existing = dailyMap.get(tx.date) || { debit: 0, kredit: 0, saldo: tx.saldo, date: tx.date };
    existing.debit += tx.debit;
    existing.kredit += tx.kredit;
    existing.saldo = tx.saldo;
    dailyMap.set(tx.date, existing);
  });

  const categories: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      total: data.total,
      count: data.count,
      percentage: totalKredit > 0 ? Number(((data.total / totalKredit) * 100).toFixed(1)) : 0,
      color: data.color,
    }))
    .sort((a, b) => b.total - a.total);

  const dailyTrend: DailyPoint[] = Array.from(dailyMap.values()).map((pt) => {
    const parts = pt.date.split(' ');
    const shortDate = parts.length >= 2 ? `${parts[0]} ${parts[1].slice(0, 3)}` : pt.date;
    return {
      date: pt.date,
      shortDate,
      debit: pt.debit,
      kredit: pt.kredit,
      saldo: pt.saldo,
    };
  });

  const saldoAkhir =
    transactions.length > 0
      ? transactions[transactions.length - 1].saldo
      : initialBalance + totalDebit - totalKredit;

  const summary: FinanceSummary = {
    initialBalance,
    initialBalanceNote,
    totalDebit,
    totalKredit,
    saldoAkhir,
    netCashFlow: totalDebit - totalKredit,
    transactionCount: transactions.length,
    incomeCount,
    expenseCount,
    largestExpense,
    largestIncome,
  };

  return { summary, categories, dailyTrend };
}

export function recalculateTabTransactions(
  transactions: Transaction[],
  initialBalance: number = 0,
  initialBalanceNote?: string,
  tabId: string = 'oktober',
  source: FinanceSource = 'user_modified'
): SheetTabInfo {
  let runningSaldo = initialBalance;
  let modifiedCount = 0;

  const reindexed: Transaction[] = transactions.map((tx, idx) => {
    const isIncome = tx.type === 'debit';
    const debit = isIncome ? Math.abs(tx.debit || 0) : 0;
    const kredit = !isIncome ? Math.abs(tx.kredit || 0) : 0;
    runningSaldo = runningSaldo + debit - kredit;

    if (tx.isCustomAdded || tx.isModified) {
      modifiedCount++;
    }

    const voucherPrefix = isIncome ? 'BKM' : 'BKK';
    const monthCode = tabId.slice(0, 3).toUpperCase();
    const voucherNumber =
      tx.voucherNumber || `${voucherPrefix}-2026${monthCode}-${String(idx + 1).padStart(4, '0')}`;
    const category = tx.category || categorizeDescription(tx.description, isIncome).category;
    const recipientOrSource =
      tx.recipientOrSource || extractRecipientOrSource(tx.description, isIncome);

    return {
      ...tx,
      id: tx.id || `TX-${tabId}-${idx + 1}-${Date.now()}`,
      index: idx + 1,
      debit,
      kredit,
      saldo: runningSaldo,
      voucherNumber,
      category,
      recipientOrSource,
      tabId,
    };
  });

  const cfg = SHEET_TABS_CONFIG.find((c) => c.id === tabId) || {
    id: tabId,
    name: `LAPKEU ${tabId.toUpperCase()}`,
    gid: '0',
    monthLabel: tabId.toUpperCase(),
  };

  const payload = computeTabPayload(
    reindexed,
    initialBalance,
    initialBalanceNote,
    source,
    cfg.monthLabel
  );

  return {
    id: tabId,
    name: cfg.name,
    gid: cfg.gid,
    monthLabel: cfg.monthLabel,
    initialBalance,
    initialBalanceNote,
    summary: payload.summary,
    categories: payload.categories,
    dailyTrend: payload.dailyTrend,
    transactions: reindexed,
    isLocallyModified: modifiedCount > 0,
  };
}

export const MONTH_NAMES_INDONESIAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function getIndonesianDateString(dateObj: Date = new Date()): string {
  const day = dateObj.getDate();
  const month = MONTH_NAMES_INDONESIAN[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getIndonesianFullDateTime(dateObj: Date = new Date()): {
  dayName: string;
  dateStr: string;
  timeStr: string;
  timeZoneStr: string;
  formattedFull: string;
} {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[dateObj.getDay()];
  const dateStr = getIndonesianDateString(dateObj);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;
  const timeZoneStr = 'WIB';

  return {
    dayName,
    dateStr,
    timeStr,
    timeZoneStr,
    formattedFull: `${dayName}, ${dateStr} • ${timeStr} ${timeZoneStr}`,
  };
}

export function getMonthSortOrder(tabNameOrId: string): number {
  const lower = tabNameOrId.toLowerCase();
  if (lower.includes('januari') || lower.includes('jan')) return 101;
  if (lower.includes('februari') || lower.includes('feb')) return 102;
  if (lower.includes('maret') || lower.includes('mar')) return 103;
  if (lower.includes('april') || lower.includes('apr')) return 104;
  if (lower.includes('mei') || lower.includes('may')) return 105;
  if (lower.includes('juni') || lower.includes('jun')) return 106;
  if (lower.includes('juli') || lower.includes('jul')) return 207;
  if (lower.includes('agustus') || lower.includes('aug')) return 208;
  if (lower.includes('september') || lower.includes('sep')) return 209;
  if (lower.includes('oktober') || lower.includes('oct')) return 210;
  if (lower.includes('november') || lower.includes('nov')) return 211;
  if (lower.includes('desember') || lower.includes('dec')) return 212;
  return 999;
}

/**
 * Computes multi-month chronological carryover bridge and consolidated recapitulation
 * Dynamically chains ending balance across all discovered tabs (Juli -> Agustus -> September -> Oktober -> etc)
 * and provides live synchronized "per hari ini" real-time clock figures.
 */
export function computeMonthlyRecap(tabs: SheetTabInfo[]): ConsolidatedRecap {
  // Sort tabs chronologically by month order
  const sortedTabs = [...tabs].sort((a, b) => {
    return getMonthSortOrder(a.name || a.id) - getMonthSortOrder(b.name || b.id);
  });

  let runningChainBalance = 0;
  let totalCumulativeDebit = 0;
  let totalCumulativeKredit = 0;
  let totalCumulativeTransactions = 0;

  const monthRows: MonthRecapRow[] = [];

  sortedTabs.forEach((tab, idx) => {
    const effectiveInitial = idx === 0 ? tab.initialBalance : runningChainBalance;
    const prevTab = idx > 0 ? sortedTabs[idx - 1] : undefined;
    const initialNote =
      idx === 0
        ? tab.initialBalanceNote || 'Saldo Awal Kas'
        : `Sisa Saldo Kas ${prevTab ? prevTab.name : 'Bulan Sebelumnya'}`;

    const totalDebit = tab.summary.totalDebit;
    const totalKredit = tab.summary.totalKredit;
    const netCashFlow = totalDebit - totalKredit;

    const calculatedEnding =
      tab.transactions.length > 0
        ? tab.transactions[tab.transactions.length - 1].saldo
        : effectiveInitial + netCashFlow;

    runningChainBalance = calculatedEnding;
    totalCumulativeDebit += totalDebit;
    totalCumulativeKredit += totalKredit;
    totalCumulativeTransactions += tab.transactions.length;

    const burnRatePercentage =
      effectiveInitial + totalDebit > 0
        ? Number(((totalKredit / (effectiveInitial + totalDebit)) * 100).toFixed(1))
        : 0;

    const nextTab = sortedTabs[idx + 1];

    monthRows.push({
      tabId: tab.id,
      name: tab.name,
      monthLabel: tab.monthLabel,
      gid: tab.gid,
      initialBalance: effectiveInitial,
      initialBalanceNote: initialNote,
      totalDebit,
      totalKredit,
      netCashFlow,
      endingBalance: calculatedEnding,
      transactionCount: tab.transactions.length,
      incomeCount: tab.summary.incomeCount,
      expenseCount: tab.summary.expenseCount,
      burnRatePercentage,
      status: netCashFlow > 0 ? 'surplus' : netCashFlow < 0 ? 'defisit' : 'seimbang',
      carryOverToNextMonth: nextTab ? calculatedEnding : undefined,
      nextMonthName: nextTab ? nextTab.name : undefined,
    });
  });

  // Latest month details for "per hari ini"
  const latestMonth = monthRows[monthRows.length - 1];
  const latestTab = latestMonth ? tabs.find((t) => t.id === latestMonth.tabId) : undefined;
  const lastTx = latestTab && latestTab.transactions.length > 0
    ? latestTab.transactions[latestTab.transactions.length - 1]
    : undefined;

  // Real-time synchronization for date and clock
  const now = new Date();
  const timeInfo = getIndonesianFullDateTime(now);

  return {
    months: monthRows,
    totalCumulativeDebit,
    totalCumulativeKredit,
    currentEndingBalance: latestMonth ? latestMonth.endingBalance : 0,
    totalCumulativeTransactions,
    asOfTodayDate: timeInfo.dateStr,
    asOfTodayTime: `${timeInfo.timeStr} ${timeZoneStr()}`,
    asOfTodayFullStr: timeInfo.formattedFull,
    lastRecordedDate: lastTx ? lastTx.date : timeInfo.dateStr,
    lastTransactionDescription: lastTx ? `${lastTx.description} (${formatRupiah(lastTx.debit || lastTx.kredit)})` : '-',
  };
}

function timeZoneStr(): string {
  return 'WIB';
}
