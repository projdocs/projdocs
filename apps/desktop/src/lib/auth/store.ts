import { create } from "zustand";
import { TypeofResult } from "../../../electron/renderer/global";



export type AuthToken = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  weak_password: string | null;
}

export enum AuthStatus {
  LOADING = "loading",
  LOGGED_OUT = "logged_out",
  LOGGED_IN = "logged_in",
}

export const LOADING: {
  state: AuthStatus.LOADING;
  user: undefined;
} = {
  state: AuthStatus.LOADING,
  user: undefined
};

export const LOGGED_OUT: {
  state: AuthStatus.LOGGED_OUT;
  user: null;
} = {
  state: AuthStatus.LOGGED_OUT,
  user: null,
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
  | { state: AuthStatus.LOGGED_IN; user: AuthToken; };

type AuthStore = {
  state: AuthState;
  set: (auth: AuthState) => void;
  login: (user: AuthToken | string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  state: Auth.LOADING,

  set: (state) => set({ state }),

  login: (user) => {
    if (typeof user === "object") set({ state: { state: AuthStatus.LOGGED_IN, user: user } });
    else {
      const token = parseAuthToken(user);
      if (token === null) set({ state: Auth.LOGGED_OUT });
      else set({ state: { state: AuthStatus.LOGGED_IN, user: token } });
    }
  },

  logout: () => set({ state: Auth.LOGGED_OUT }),
}));

const parseAuthToken = (raw: string): AuthToken | null => {

  type Checker<K extends string & keyof AuthToken> = {
    key: K,
    typ: TypeofResult,
  }
  const check = (v: any, fields: Checker<string & keyof AuthToken>[]): boolean => {
    if (typeof v !== "object" || v === null) return false;
    return fields
      .map(({ key, typ }) => key in v && typeof v[key] === typ && v[key])
      .reduce((p, c) => p && c, true);
  };

  try {
    const parsed = JSON.parse(raw);
    if (check(parsed, [
      {
        key: "access_token",
        typ: "string",
      },
      {
        key: "refresh_token",
        typ: "string",
      },
      {
        key: "token_type",
        typ: "string"
      },
      {
        key: "expires_in",
        typ: "number",
      },
      {
        key: "expires_at",
        typ: "number",
      },
    ])) {
      return parsed as AuthToken;
    } else {
      console.warn("Malformed auth token object");
      return null;
    }
  } catch (err) {
    console.error("Failed to parse stored token:", err);
    return null;
  }
};