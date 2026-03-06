import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Halal Bihalal Bharata Group Spesial Konser Wali Band 2026",
  description: "Spesial Konser Wali Band - QR Check-in & Event Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans transition-colors duration-300`}
      >
        <Provider>
          <main className="min-h-screen relative flex flex-col">
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
