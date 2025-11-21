import { create } from "zustand";
import { random } from "@workspace/admin/lib/random.ts";

type SetupProjDocsStateSchema = {
  [key: string]: {
    [key: string]: string | boolean;
  }
}

export type SetupProjDocsState = {
  database: {
    mode: "self-hosted" | "remote";
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  };
  auth: {
    jwtSecret: string;
    apiUrl: string;
    siteUrl: string;
    useCloudflare: boolean;
    cloudflareApiToken: string;
  };
};

export const defaultSetupProjDocsState: SetupProjDocsState = {
  database: {
    mode: "self-hosted",
    host: "",
    port: "",
    database: "",
    username: "",
    password: random.string(32),
  },
  auth: {
    jwtSecret: random.string(32),
    apiUrl: "",
    siteUrl: "",
    useCloudflare: false,
    cloudflareApiToken: "",
  }
} satisfies SetupProjDocsStateSchema & SetupProjDocsState;

export interface SetupProjDocsStore {
  state: SetupProjDocsState;
  replace: <NS extends keyof SetupProjDocsState>(
    ns: NS,
    value: SetupProjDocsState[NS]
  ) => void;
  set: <
    NS extends keyof SetupProjDocsState,
    K extends keyof SetupProjDocsState[NS]
  >(
    ns: NS,
    key: K,
    value: SetupProjDocsState[NS][K]
  ) => void;
}

export const useSetupProjDocsStore = create<SetupProjDocsStore>((set) => ({
  state: defaultSetupProjDocsState,
  replace: (ns, value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        [ns]: value
      }
    })),
  set: (ns, key, value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        [ns]: {
          ...prev.state[ns],
          [key]: value,
        },
      },
    })),
}));