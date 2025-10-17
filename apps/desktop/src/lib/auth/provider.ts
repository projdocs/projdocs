import { ReactNode, useEffect } from "react";
import { useAuthStore } from "./store";
import { AUTH_UPDATE_EVENT } from "@workspace/desktop/electron/src/secrets/consts";



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
    window.app.on(AUTH_UPDATE_EVENT, () => {
      console.log("Received 'auth:update' event");
      (async () => await getUser())();
    });
  }, []);

  return children;
};