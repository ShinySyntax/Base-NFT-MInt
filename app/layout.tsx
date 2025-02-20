import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import type { Metadata } from 'next';
import { Climate_Crisis } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Ghost Festival",
  description: "Ghost Festival",
};

const climateCrisis = Climate_Crisis({
  subsets: ["latin"],
  variable: "--font-climate-crisis",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={climateCrisis.variable}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
