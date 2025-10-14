import { useEffect } from "react";
import { useAuthStore } from "./store";



export const AuthProvider = () => {

  const auth = useAuthStore();

  useEffect(() => {
    const getUser = () => window.auth.list().then((accounts) => {
      const account = accounts.find(({ account }) => account === "00000000-0000-0000-0000-000000000000");
      if (account !== undefined) auth.login(account.password);
      else auth.logout();
    });

    // get user for first time on mount
    (async () => await getUser())();

    // handle user updates
    return window.api.on("auth:update", (data) => {
      console.log("Received 'auth:update' event", data);
      (async () => await getUser())();
    });
  }, []);
}