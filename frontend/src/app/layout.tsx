import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerPilot | AI-Powered Smart Career Copilot",
  description: "Navigate your career journey with real-time job scraping, automated resumes fit analysis, Kanban application logs, direct cover letter generation, and conversational AI coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="font-sans min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-[#f8fafc] transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
