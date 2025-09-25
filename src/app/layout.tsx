import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ClassConnect',
  description: 'Seamless attendance tracking for modern classrooms.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased min-h-screen flex flex-col bg-background text-foreground",
        ptSans.variable
      )}>
        <Header />
        <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow flex flex-col">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
