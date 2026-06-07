import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { BackgroundCanvas } from '@/components/layout/BackgroundCanvas';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CareerPilot',
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
        style={{ background: 'var(--cp-bg)', color: 'var(--cp-text-primary)' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <BackgroundCanvas />

          
          <div className="relative z-10 w-full min-h-screen flex flex-col">
            {children}
            <ToastContainer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
