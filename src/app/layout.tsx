import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const sukaCoffee = localFont({
  src: '../fonts/SukaCoffee.otf',
  variable: '--font-suka-coffee',
  display: 'swap',
})

const qurova = localFont({
  src: '../fonts/Qurova.otf',
  variable: '--font-qurova',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tuna Supply',
  description: 'Personal cat health hub for Tuna',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tuna Supply',
  },
}

export const viewport: Viewport = {
  themeColor: '#6B7F5E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sukaCoffee.variable} ${qurova.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tuna Supply" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="font-body">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
