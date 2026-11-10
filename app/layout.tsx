import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/space-grotesk';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import './art.css';

export const metadata: Metadata = {
  title: 'Teez — The internet, on your time.',
  description: 'A finite pop culture briefing with tiny clips, the lore behind them, and a real stopping point.',
  applicationName: 'Teez',
  icons: { icon: '/teez-mark.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
