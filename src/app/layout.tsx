import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { DbProvider } from '@/components/providers/DbProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
};

export const metadata: Metadata = {
  title: 'ProDad - Support Through Parenthood',
  description:
    'Helping fathers support their partners during pregnancy, childbirth, and early parenthood.',
  keywords: [
    'dad',
    'father',
    'pregnancy',
    'newborn',
    'support',
    'parenting',
    'calendar',
    'reminders',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ProDad',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'ProDad',
  authors: { name: 'ProDad Team' },
  generator: 'Next.js',
  creator: 'ProDad Team',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DbProvider>
            <AuthProvider>
              <ServiceWorkerRegistration />
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </DbProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
