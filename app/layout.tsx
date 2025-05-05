// app/layout.tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import './globals.css';
import Footer from '@/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider >
          <NextAuthProvider>
            <main className="min-h-screen">
              {children}
              <section id="footer" className="px-2 lg:px-4 py-5 rounded-lg">
                <Footer />
              </section>
            </main>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}