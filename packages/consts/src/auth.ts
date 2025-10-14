export type AuthRequest = {
  session: string;
  url: string;
  publicKey: string;
  supabaseUrl: string;
}

type MakeNullable<T extends {}> = {
  [K in keyof T]: T[K] | null;
}

export const queryParamsToRequest = (value: URLSearchParams): MakeNullable<AuthRequest> => ({
  session: value.get("session") ?? null,
  publicKey: value.get("public-key"),
  url: value.get("url"),
  supabaseUrl: value.get("supabase-url"),
});