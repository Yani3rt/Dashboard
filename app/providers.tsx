"use client";

import { DashboardProvider } from "@/lib/state/dashboard-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
