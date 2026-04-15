import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John Gabriel Ofiangga — Portfolio',
  description: 'Full-stack developer based in Caloocan City, PH. BSCS student building real-world systems — IoT, web apps, and more.',
  openGraph: {
    title: 'John Gabriel Ofiangga — Portfolio',
    description: 'Full-stack developer based in Caloocan City, PH. BSCS student building real-world systems — IoT, web apps, and more.',
    url: 'https://johngabrielle.dev',
    siteName: 'John Gabriel Ofiangga',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'John Gabriel Ofiangga — Portfolio',
    description: 'Full-stack developer based in Caloocan City, PH.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
