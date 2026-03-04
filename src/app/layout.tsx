import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { PasscodeGate } from "@/components/PasscodeGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "20 to 1 | Practical Agentic Solutions",
  description: "Welcome to the future of your business. Practical Agentic Solutions for business owners.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${exo2.variable} font-sans antialiased flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]`}
      >
        <AuthProvider>
          <CartProvider>
            <PasscodeGate>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </PasscodeGate>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
