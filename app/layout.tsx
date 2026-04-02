import type { Metadata } from "next";
import { Doto, Space_Grotesk, Space_Mono } from "next/font/google";
import Providers from "@/app/providers";
import { AppShell } from "@/components/shell";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const displayFont = Doto({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Yani's Dashboard",
  description: "Dark-mode personal dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} min-h-screen`}>
        <ErrorBoundary>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
