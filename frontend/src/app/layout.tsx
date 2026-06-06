import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { StatusHood } from '@/components/layout/StatusHood';
import { CommandDock } from '@/components/layout/CommandDock';
import { PageTransition } from '@/components/layout/PageTransition';
import { ToastContainer } from '@/components/ui/ToastContainer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CareerHUD',
  description: 'AI-powered career intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-sm overflow-hidden relative`}
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          {/* ── Animated orb background ── */}
          <div className="orb-layer" aria-hidden>
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>

          {/* ── Dot grid overlay ── */}
          <div className="dot-grid" aria-hidden />

          {/* ── App shell ── */}
          <div className="relative z-10 w-full h-screen flex flex-col overflow-hidden">
            <StatusHood />

            <main className="w-full h-full pt-14 pb-24 flex items-start justify-center px-4 sm:px-6 overflow-hidden">
              <div className="max-w-6xl w-full h-full">
                <PageTransition>
                  {children}
                </PageTransition>
              </div>
            </main>

            <ToastContainer />
            <CommandDock />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
