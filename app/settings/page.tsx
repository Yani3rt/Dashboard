"use client";

import { ChangeEvent, useState } from "react";
import { BackupPayload } from "@/lib/domain/models";
import { useDashboard } from "@/lib/state/dashboard-context";

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
    if (!file) {
      return;
    }

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
      <section className="card">
        <h2>Settings</h2>
        <div className="stack-form">
          <label htmlFor="theme">Theme</label>
          <select id="theme" value={state.theme} onChange={(event) => setTheme(event.target.value as "dark" | "light")}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
          <button type="button" onClick={onExport}>
            Export Backup
          </button>
          <input type="file" accept="application/json" onChange={onImport} />
          <button type="button" onClick={resetAll}>
            Reset Local Data
          </button>
        </div>
        {message ? <p>{message}</p> : null}
      </section>
    </div>
  );
}
