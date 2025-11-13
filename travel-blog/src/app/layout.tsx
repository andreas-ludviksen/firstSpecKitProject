import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navigation from '@/components/Navigation';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Travel Blog - Family Adventures Around the World',
  description:
    'Explore our family travel stories, stunning photography highlights, and practical tips for traveling with kids.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 Travel Blog. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

