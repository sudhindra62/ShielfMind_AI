import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { WebSocketProvider } from '@/components/layout/WebSocketProvider'

export const metadata: Metadata = {
  title: 'ShelfMind AI',
  description: 'Local-first AI retail intelligence frontend'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <WebSocketProvider>
          <div className="aurora-bg" />
          <div className="relative flex min-h-screen">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <TopNav />
              <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
          <Toaster position="top-right" toastOptions={{ style: { background: '#0d1526', color: '#fff', border: '1px solid rgba(0,212,255,.22)' } }} />
        </WebSocketProvider>
      </body>
    </html>
  )
}
