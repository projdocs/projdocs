import { create } from "zustand";



type AppState = {
  router: {
    path: string;
  };
  storage: Map<string, string>
};

type AppStore<T> = {
  state: T;
  set: (state: T) => void;
  navigate: (url: string) => void;
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">
};

export const useAppStore = create<AppStore<AppState>>((set, getState) => ({
  state: {
    storage: new Map<string, string>(),
    router: {
      path: "/dashboard"
    },
  },
  storage: {
    getItem: (key) => getState().state.storage.get(key) ?? null,
    setItem: (key, value) => getState().state.storage.set(key, value),
    removeItem: (key) => getState().state.storage.delete(key),
  },
  set: (state) => set({ state }),
  navigate: (url) => set(({ state }) => ({ state: { ...state, router: { ...state.router, path: url } } })),
}));