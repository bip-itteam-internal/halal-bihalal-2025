import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIP Event Invitation System",
  description: "Next-generation QR Check-in & Event Management",
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
        <ThemeProvider attribute="class" defaultTheme="light">
          <main className="min-h-screen relative flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
