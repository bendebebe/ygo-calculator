import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yu-Gi-Oh Deck Probability Calculator',
  description: 'Calculate the probability of drawing specific card combinations in your Yu-Gi-Oh deck',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
