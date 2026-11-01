import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Laporan Keuangan Kantor - ISMAYA PROPERTY',
  description:
    'Sistem informasi laporan keuangan kas kantor ISMAYA PROPERTY terintegrasi langsung dengan Google Sheets secara real-time, menyajikan arus kas, rincian debit-kredit, analisis pengeluaran, dan audit bukti transaksi.',
  keywords: [
    'Laporan Keuangan ISMAYA PROPERTY',
    'Kas Kantor ISMAYA PROPERTY',
    'Laporan Keuangan Properti',
    'Google Sheets Financial Dashboard',
    'Buku Kas Kantor Real Estate',
  ],
  authors: [{ name: 'ISMAYA PROPERTY Finance Division' }],
  openGraph: {
    title: 'Laporan Keuangan Kantor - ISMAYA PROPERTY',
    description:
      'Sistem informasi laporan keuangan kas kantor ISMAYA PROPERTY terintegrasi langsung dengan Google Sheets secara real-time.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'ISMAYA PROPERTY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laporan Keuangan Kantor - ISMAYA PROPERTY',
    description:
      'Dashboard keuangan kas kantor ISMAYA PROPERTY terhubung dengan Google Sheets secara real-time.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'ISMAYA PROPERTY Financial Report',
    alternateName: 'Laporan Keuangan Kantor ISMAYA PROPERTY',
    description:
      'Dashboard laporan keuangan kantor ISMAYA PROPERTY terintegrasi langsung dengan Google Sheets secara real-time.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jakarta',
      addressRegion: 'DKI Jakarta',
      addressCountry: 'ID',
    },
  };

  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200"
      >
        {children}
      </body>
    </html>
  );
}
