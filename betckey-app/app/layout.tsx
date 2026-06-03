import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

export const metadata: Metadata = {
  title: `${brandName} — Etiquetas Brother Bolivia`,
  description: 'Etiquetas térmicas BETCKEY compatibles con impresoras Brother QL. Venta por unidad, envío a todo Bolivia. DK-1201, DK-1202, DK-1241, DK-2205.',
  openGraph: {
    title: `${brandName} — Etiquetas Brother Bolivia`,
    description: 'Etiquetas térmicas BETCKEY compatibles con impresoras Brother QL. Envío a todo Bolivia.',
    type: 'website',
    locale: 'es_BO',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandName} — Etiquetas Brother Bolivia`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body className="font-[family-name:var(--font-dm-sans)] antialiased flex flex-col min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
