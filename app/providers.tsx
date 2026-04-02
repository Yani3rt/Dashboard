"use client";

import { DashboardProvider } from "@/lib/state/dashboard-context";
import SessionProvider from "@/components/SessionProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </SessionProvider>
  );
}
