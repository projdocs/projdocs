import { ReactNode, useEffect } from "react";
import { useAuthStore } from "./store";
import { Events } from "@workspace/desktop/electron/src/ipc/types";



export const AuthProvider = ({ children }: {
  children: ReactNode
}) => {

  const auth = useAuthStore();

  useEffect(() => {
    const getUser = () => window.secrets.get().then((secret) => {
      if (typeof secret === "string") auth.login(secret);
      else auth.logout();
    });

    // get user for first time on mount
    (async () => await getUser())();

    // handle user updates
    return window.app.on(Events.AUTH_UPDATE, () => {
      console.log(`Received '${Events.AUTH_UPDATE}' event`);
      (async () => await getUser())();
    });
  }, []);

  return children;
};