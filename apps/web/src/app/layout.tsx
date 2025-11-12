import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StarMKT OS',
  description: 'Painel operacional da StarMKT'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
