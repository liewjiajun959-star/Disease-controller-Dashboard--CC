import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HantaWatch — Global Intelligence Dashboard',
  description:
    'Hantavirus outbreak intelligence and visualization platform. Simulated demo data for informational purposes only. Always verify with official health authorities.',
  keywords: ['Hantavirus', 'outbreak intelligence', 'public health', 'disease surveillance'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0a0e1a] text-slate-200 h-screen overflow-hidden antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
