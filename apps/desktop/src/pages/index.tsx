import { Login } from "./Login";
import React from "react";
import { AuthProvider } from "@workspace/desktop/src/lib/auth/provider";
import { Main } from "@workspace/desktop/src/pages/Main";



export const Pages = () => (
  <div className="flex flex-1">
    <AuthProvider>
      <Login>
        <Main/>
      </Login>
    </AuthProvider>
  </div>
);