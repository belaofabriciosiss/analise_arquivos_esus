import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'e-SUS XML Dashboard',
  description: 'Análise de arquivos .esus.xml - 100% Client Side',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
