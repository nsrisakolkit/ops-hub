import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { GlobalHeader } from './shared/global-header';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'OpsHub Console',
  description: 'Operational hub for projects, members, and tasks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground selection:bg-sky-500/30 selection:text-white">
        <div className="relative mx-auto flex min-h-screen w-full max-w-[120rem] flex-col px-4 pb-12 pt-20 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[95rem] bg-gradient-to-b from-white/5 via-transparent to-transparent blur-3xl"></div>
          <GlobalHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
