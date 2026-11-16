import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Phronesis College | Secondary School Portal',
  description: 'Knowledge and Wisdom • Official Management Portal & Admissions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f4f6f9] text-[#0f1e36]">
        {children}
      </body>
    </html>
  );
}