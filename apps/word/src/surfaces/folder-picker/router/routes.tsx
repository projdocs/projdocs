import { Route, Router } from "@workspace/word/surfaces/folder-picker/router/router";
import { Clients } from "@workspace/word/surfaces/folder-picker/router/clients";



export const Routes = () => (
  <Router>
    <Route pattern={"/dashboard/clients"}>
      <Clients/>
    </Route>
  </Router>
);