import type { Metadata } from "next";
import { ReactNode } from 'react'
import { QueryProvider } from '@/providers/query-provider'
import { UrqlProvider } from '@/providers/urql-provider'
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = { title: 'OpsHub', description: 'Operations Hub' }


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background text-foreground ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <UrqlProvider>
            {children}
          </UrqlProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
