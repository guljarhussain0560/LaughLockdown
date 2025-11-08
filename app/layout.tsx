import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SocketProvider } from '@/lib/socketContext'

export const metadata: Metadata = {
  title: 'LaughLockdown - Meme Games Challenge',
  description: 'Try not to laugh! Test your self-control with hilarious memes in fun challenges and compete on the leaderboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-gray-900 bg-white dark:bg-gray-950 dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
