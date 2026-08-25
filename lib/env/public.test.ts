import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabasePublicEnv } from "./public";

describe("getSupabasePublicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns valid browser-safe Supabase settings", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(getSupabasePublicEnv()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("rejects a malformed project URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    expect(() => getSupabasePublicEnv()).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.",
    );
  });

  it("rejects a missing publishable key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabasePublicEnv()).toThrow(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.",
    );
  });
});
