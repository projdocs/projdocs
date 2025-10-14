import { Login } from "./Login";
import React from "react";
import { AuthProvider } from "@workspace/desktop/src/lib/auth/provider";



export const Pages = () => (
  <div className="flex flex-1">
    <AuthProvider>
      <Login/>
    </AuthProvider>
  </div>
);