import type { Metadata } from 'next';
import './globals.css';

const themeInitScript = `(function(){try{var key='psp-theme';var saved=localStorage.getItem(key);var isValid=saved==='dark'||saved==='light';var systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=isValid?saved:(systemDark?'dark':'light');document.documentElement.dataset.theme=theme;}catch(_){document.documentElement.dataset.theme='dark';}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
