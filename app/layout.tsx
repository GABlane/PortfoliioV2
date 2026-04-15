import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John Gabriel — Portfolio',
  description: 'Full-stack developer & designer. PSP-inspired portfolio experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
