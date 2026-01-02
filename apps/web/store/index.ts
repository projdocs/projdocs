import { create } from "zustand";
import { Tables } from "@workspace/supabase/types.gen";
import { User } from "@supabase/supabase-js";



type AppStateSchema = {
  [key: string]: {
    [key: string]: string | boolean | number | null | undefined;
  }
}

export type AppState = {
  auth: |
    {
      company: Tables<"company">;
      user: Tables<"users">;
      meta: User;
      isAdmin: boolean;
    } |
    {
      company: null;
      user: null;
      meta: null;
      isAdmin: null;
    } |
    {
      company: undefined;
      user: undefined;
      meta: undefined;
      isAdmin: undefined;
    }
};

const defaultAppState: AppState = {
  auth: {
    company: undefined,
    user: undefined,
    meta: undefined,
    isAdmin: undefined,
  }
} satisfies AppState & AppStateSchema;

export interface AppsStore {
  state: AppState;
  replace: <NS extends keyof AppState>(
    ns: NS,
    value: AppState[NS]
  ) => void;
  set: <
    NS extends keyof AppState,
    K extends keyof AppState[NS]
  >(
    ns: NS,
    key: K,
    value: AppState[NS][K]
  ) => void;
}

export const useAppStore = create<AppsStore>((set) => ({
  state: defaultAppState,
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