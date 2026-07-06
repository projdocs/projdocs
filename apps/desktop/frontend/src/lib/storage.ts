export type StorageKey = {
  [key: string]: string | StorageKey;
}

export const StorageKeys = {
  ProjDocs: {
    Auth: {
      Session: "projdocs:host:session"
    } as const,
    Host: {
      Web: "projdocs:host:web",
      API: "projdocs:host:api"
    } as const,
  } as const,
} as const satisfies StorageKey

