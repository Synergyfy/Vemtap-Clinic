"use client";

import { useMemo } from "react";
import { useMySettings, useBulkSetMySettings } from "./useSettings";

export type PreferenceValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

const decodePreference = (raw: string): unknown => {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

/**
 * Read/write the signed-in user's personal preferences.
 *
 * Values are stored as JSON strings so booleans, numbers, objects and arrays
 * round-trip without losing their type. Pages can hydrate local form state from
 * `prefs` and call `save(patch)` when the user presses Save.
 */
export function useUserPreferences<T extends Record<string, any> = Record<string, any>>() {
  const { data: raw } = useMySettings();
  const bulkSet = useBulkSetMySettings();

  const prefs = useMemo(() => {
    const parsed: Record<string, unknown> = {};
    Object.entries(raw ?? {}).forEach(([key, value]) => {
      parsed[key] = decodePreference(value);
    });
    return parsed as T;
  }, [raw]);

  const save = async (patch: Record<string, PreferenceValue>) => {
    const settings = Object.entries(patch).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));
    await bulkSet.mutateAsync(settings);
  };

  return {
    prefs,
    save,
    // `data` is undefined until the first successful fetch, which is the only
    // moment it is safe to hydrate form state from saved preferences.
    isLoaded: raw !== undefined,
    isSaving: bulkSet.isPending,
    error: bulkSet.error,
  };
}
