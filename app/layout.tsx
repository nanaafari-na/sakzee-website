import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sakzee — Moving Dreams, Delivering Growth',
  description: "Ghana's leading fulfillment and logistics partner. Warehousing, order fulfillment, shipping and delivery across Ghana.",
  keywords: 'logistics Ghana, warehousing Ghana, delivery Ghana, fulfillment Ghana, Sakzee',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Sakzee — Moving Dreams, Delivering Growth',
    description: "Ghana's leading fulfillment and logistics partner.",
    url: 'https://sakzee.com',
    siteName: 'Sakzee',
    locale: 'en_GH',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}