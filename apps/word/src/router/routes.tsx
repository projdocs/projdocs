import { Route, Router } from "@workspace/word/router/router";
import React from "react";
import { Clients } from "@workspace/word/router/clients";



export const Routes = () => (
  <Router>

    <Route pattern={"/dashboard/clients"}>
      <Clients/>
    </Route>

  </Router>
);