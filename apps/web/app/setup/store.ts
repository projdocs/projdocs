import { create } from "zustand";
import { Enums } from "@workspace/supabase/types.gen";



type SetupProjDocsStateSchema = {
  [key: string]: {
    [key: string]: string | boolean | File | null;
  }
}

export type SetupProjDocsState = {
  company: {
    name: string;
    logoFile: File | null;
    logoImage: string | null;
  };
  defaultPermissions: {
    clients: Enums<"access">;
    projects: Enums<"access">;
  }
};

export const defaultSetupProjDocsState: SetupProjDocsState = {
  company: {
    name: "",
    logoImage: null,
    logoFile: null,
  },
  defaultPermissions: {
    clients: "NONE",
    projects: "NONE",
  },
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