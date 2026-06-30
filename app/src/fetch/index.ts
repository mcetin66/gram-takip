import type { Fetcher } from "./Fetcher";
import { MockFetcher } from "./MockFetcher";
import { BackendFetcher } from "./BackendFetcher";
import type { Ayarlar } from "../types";

// Ayarlara göre uygun Fetcher'ı üret. Mock örneği kalıcı (fiyat yürüyüşü için).
const mockSingleton = new MockFetcher();

export function createFetcher(ayarlar: Ayarlar): Fetcher {
  if (ayarlar.kaynak === "backend") return new BackendFetcher(ayarlar.backendUrl);
  return mockSingleton;
}

export type { Fetcher };
