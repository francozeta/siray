const supabaseUrlKey = "NEXT_PUBLIC_SUPABASE_URL";
const supabasePublishableKey = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !isHttpUrl(url)) {
    throw new Error(`${supabaseUrlKey} must be a valid HTTP(S) URL.`);
  }

  if (!publishableKey?.trim()) {
    throw new Error(`${supabasePublishableKey} is required.`);
  }

  return { url, publishableKey };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
