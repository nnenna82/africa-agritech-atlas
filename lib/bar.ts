"use client";

// The bar's choices (I am a · Region · Country · Interested in).
// They are saved in the visitor's own browser only (localStorage), never sent anywhere.
// Any component can read them with useBar(); changing them updates every component on the page.

import { useSyncExternalStore } from "react";

export type BarState = { role: string; region: string; country: string; segment: string };

export const EMPTY_BAR: BarState = { role: "", region: "", country: "", segment: "" };
const KEY = "atlas_bar";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState: BarState = EMPTY_BAR;

function read(): BarState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    const v = raw ? (JSON.parse(raw) as Partial<BarState>) : {};
    cachedState = {
      role: String(v.role ?? ""),
      region: String(v.region ?? ""),
      country: String(v.country ?? ""),
      segment: String(v.segment ?? ""),
    };
  } catch {
    cachedState = EMPTY_BAR;
  }
  return cachedState;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function setBar(patch: Partial<BarState>) {
  const next = { ...read(), ...patch };
  // Switching region clears the country.
  if ("region" in patch && !("country" in patch)) next.country = "";
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows can block storage: keep the choice for this page view only.
    cachedRaw = JSON.stringify(next);
    cachedState = next;
  }
  listeners.forEach((fn) => fn());
}

export const clearBar = () => setBar({ ...EMPTY_BAR });

/** The bar's current choices. Empty on the server and on first paint, then the saved choices. */
export function useBar(): BarState {
  return useSyncExternalStore(subscribe, read, () => EMPTY_BAR);
}
