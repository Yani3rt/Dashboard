import { AppState } from "@/lib/domain/models";

export interface DataProvider {
  fetch(): Promise<AppState>;
  sync(next: AppState): Promise<void>;
  health(): Promise<{ ok: boolean; provider: string }>;
}
