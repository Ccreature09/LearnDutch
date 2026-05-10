import { DrillLogEntry, Flashcard } from "@/lib/types";
import { AdaptiveProfile } from "../adaptive-learning/tracker";

const FLASHCARD_KEY = "dutch-trainer.flashcards.v2";
const DRILL_LOG_KEY = "dutch-trainer.drill-log.v2";
const ADAPTIVE_KEY = "dutch-trainer.adaptive.v1";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  return parseJson<Flashcard[]>(window.localStorage.getItem(FLASHCARD_KEY), []);
}

export function saveFlashcards(cards: Flashcard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards));
}

export function loadDrillLog(): DrillLogEntry[] {
  if (typeof window === "undefined") return [];
  return parseJson<DrillLogEntry[]>(window.localStorage.getItem(DRILL_LOG_KEY), []);
}

export function saveDrillLog(entries: DrillLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRILL_LOG_KEY, JSON.stringify(entries.slice(0, 200)));
}

export function loadAdaptiveProfile(): AdaptiveProfile {
  if (typeof window === "undefined") return { weaknessByType: {}, attempts: 0 };
  return parseJson<AdaptiveProfile>(window.localStorage.getItem(ADAPTIVE_KEY), {
    weaknessByType: {},
    attempts: 0
  });
}

export function saveAdaptiveProfile(profile: AdaptiveProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(profile));
}

export function clearAppSessionData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FLASHCARD_KEY);
  window.localStorage.removeItem(DRILL_LOG_KEY);
  window.localStorage.removeItem(ADAPTIVE_KEY);
}

