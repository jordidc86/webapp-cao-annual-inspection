import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "CAO | Annual Inspection Management",
  description: "Aviation-compliant inspection workflow for hot air balloons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--primary)' }}>
              CAO<span style={{ color: 'var(--foreground)' }}>APP</span>
            </div>
            <nav style={{ display: 'flex', gap: '2rem' }}>
              <a href="/">Balloons</a>
              <a href="/inspections">Inspections</a>
              <a href="/settings">Settings</a>
            </nav>
          </div>
        </header>
        <main style={{ padding: '2rem 0' }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '4rem 0', marginTop: 'auto' }}>
          <div className="container" style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} Part-CAO Organization. Aviation Compliance Protocol v1.0.
          </div>
        </footer>
      </body>
    </html>
  );
}
