export type AuthRequest = {
  jwt: string;
  url: string;
  supabaseKey: string;
  supabaseUrl: string;
}

type MakeNullable<T extends {}> = {
  [K in keyof T]: T[K] | null;
}

export const queryParamsToRequest = (value: URLSearchParams): MakeNullable<AuthRequest> => ({
  jwt: value.get("jwt") ?? null,
  url: value.get("url"),
  supabaseKey: value.get("supabase-key"),
  supabaseUrl: value.get("supabase-url"),
});