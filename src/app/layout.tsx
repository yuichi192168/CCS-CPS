import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const CCS_LOGO = "https://i.imgur.com/5aAzmh5.png"

export const metadata: Metadata = {
  title: 'CCS Comprehensive Profiling System - PNC',
  description: 'Centralized management for students, faculty, research, and events at the College of Computer Studies, Pamantasan ng Cabuyao.',
  icons: {
    icon: [
      { url: CCS_LOGO, type: 'image/png' },
    ],
    shortcut: CCS_LOGO,
    apple: CCS_LOGO,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen">
        <FirebaseClientProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}