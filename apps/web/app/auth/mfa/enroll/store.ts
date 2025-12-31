import { create } from "zustand";
import { MFAEnrollParams } from "@supabase/supabase-js";



type SetupMFAStateSchema = {
  [key: string]: {
    [key: string]: string | boolean | number | null;
  }
}

export type SetupMFAState = {
  options: {
    type: MFAEnrollParams["factorType"] | null;
    name: string;
  }
  totp: {
    qrCode: string | null;
    factorId: string | null;
    value: string;
  };
};

const defaultState: SetupMFAState = {
  options: {
    type: null,
    name: "",
  },
  totp: {
    qrCode: null,
    factorId: null,
    value: "",
  },
} satisfies SetupMFAStateSchema & SetupMFAState;

export interface SetupMFAStore {
  state: SetupMFAState;
  replace: <NS extends keyof SetupMFAState>(
    ns: NS,
    value: SetupMFAState[NS]
  ) => void;
  set: <
    NS extends keyof SetupMFAState,
    K extends keyof SetupMFAState[NS]
  >(
    ns: NS,
    key: K,
    value: SetupMFAState[NS][K]
  ) => void;
}

export const useSetupMFAStore = create<SetupMFAStore>((set) => ({
  state: defaultState,
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