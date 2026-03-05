import type { Metadata } from "next";
import Providers from "@/app/providers";
import { AppShell } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Night Shift Dashboard",
  description: "Dark-mode personal dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
