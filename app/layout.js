import { Inter } from 'next/font/google';
import Navigation from "@/components/Navigation";
import { ThemeProvider } from '@/contexts/ThemeContext';
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
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <Navigation />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
