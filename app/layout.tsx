// app/layout.tsx
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";

import "./globals.css"; // Ensure globals.css is correctly imported
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar"; // Ensure Navbar is imported for the global layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SupabaseAuthProvider>
            <Navbar />
            <main className="flex flex-col min-h-[calc(100vh-var(--navbar-height))]">
              {children}
              <section
                id="footer"
                className="px-2 lg:px-4 py-5 rounded-lg mt-auto"
              >
                <Footer />
              </section>
            </main>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
