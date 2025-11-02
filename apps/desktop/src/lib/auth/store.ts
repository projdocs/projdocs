import { create } from "zustand";


export type AuthSettings = {
  token: string;
  url: string;
  supabase: {
    url: string;
    key: string;
  };
}

export enum AuthStatus {
  LOADING = "loading",
  LOGGED_OUT = "logged_out",
  LOGGED_IN = "logged_in",
}

export const LOADING: {
  state: AuthStatus.LOADING;
  settings: undefined;
} = {
  state: AuthStatus.LOADING,
  settings: undefined
};

export const LOGGED_OUT: {
  state: AuthStatus.LOGGED_OUT;
  settings: null;
} = {
  state: AuthStatus.LOGGED_OUT,
  settings: null,
};

export const Auth: {
  LOADING: typeof LOADING;
  LOGGED_OUT: typeof LOGGED_OUT;
} = {
  LOADING,
  LOGGED_OUT
};

export type AuthState =
  | typeof LOADING
  | typeof LOGGED_OUT
  | { state: AuthStatus.LOGGED_IN; settings: AuthSettings; };

type AuthStore = {
  state: AuthState;
  set: (auth: AuthState) => void;
  login: (settings: AuthSettings | string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  state: Auth.LOADING,

  set: (state) => set({ state }),

  login: (settings) => {
    if (typeof settings === "object") set({ state: { state: AuthStatus.LOGGED_IN, settings: settings } });
    else {
      const token = parseAuthToken(settings);
      if (token === null) set({ state: Auth.LOGGED_OUT });
      else set({ state: { state: AuthStatus.LOGGED_IN, settings: token } });
    }
  },

  logout: () => set({ state: Auth.LOGGED_OUT }),
}));

const parseAuthToken = (raw: string): AuthSettings | null => {

  type Checker<T> = {
    key: string & keyof T,
    typ: TypeofResult,
  }
  const check = <T>(v: any, fields: Checker<T>[]): boolean => {
    if (typeof v !== "object" || v === null) return false;
    return fields
      .map(({ key, typ }) => key in v && typeof v[key] === typ && v[key])
      .reduce((p, c) => p && c, true);
  };

  try {
    const parsed = JSON.parse(raw);
    if (check<AuthSettings>(parsed, [
      {
        key: "url",
        typ: "string",
      },
      {
        key: "supabase",
        typ: "object",
      },
      {
        key: "token",
        typ: "string",
      },
    ]) && check<{
      key: string;
      url: string;
    }>(parsed.supabase, [
      {
        key: "key",
        typ: "string",
      },
      {
        key: "url",
        typ: "string",
      }
    ])) {
      return parsed as AuthSettings;
    } else {
      console.warn("Malformed auth token object");
      return null;
    }
  } catch (err) {
    console.error("Failed to parse stored token:", err);
    return null;
  }
};