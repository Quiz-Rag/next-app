import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import './globals.css';

// Load Inter and define a CSS variable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'NetSec Arcade',
  description: 'Interactive Network Security Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
