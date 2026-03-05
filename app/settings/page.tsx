"use client";

import { ChangeEvent, useState } from "react";
import { BackupPayload } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { state, setTheme, exportBackup, importBackup, resetAll } = useDashboard();
  const [message, setMessage] = useState("");

  const onExport = () => {
    const payload = exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exported.");
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const payload = JSON.parse(text) as BackupPayload;
      const result = importBackup(payload);
      setMessage(result.ok ? "Backup imported." : result.error ?? "Import failed.");
    } catch {
      setMessage("Invalid backup file");
    }
  };

  return (
    <div className="stack-page">
      <Card className="card">
        <h2>Settings</h2>
        <div className="stack-form">
          <label htmlFor="theme">Theme</label>
          <Select value={state.theme} onValueChange={(value: "dark" | "light") => setTheme(value)}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={onExport}>
            Export Backup
          </Button>
          <Input type="file" accept="application/json" onChange={onImport} />
          <Button type="button" variant="outline" onClick={resetAll}>
            Reset Local Data
          </Button>
        </div>
        {message ? <Badge className="mt-3">{message}</Badge> : null}
      </Card>
    </div>
  );
}
