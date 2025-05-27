import { ThemeProvider } from "@/providers/ThemeProvider";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";

import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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
            <main className="flex flex-col min-h-[calc(100vh-var(--navbar-height))] bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
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
