import { Route, Routes as $Routes } from "react-router-dom";
import Landing from "@apps/desktop/routes/handlers/landing";
import LoginPage from "@apps/desktop/routes/handlers/auth-login";
import RootLayout from "@apps/desktop/routes/layouts";
import AuthCallback from "@apps/desktop/routes/handlers/auth-callback";
import OrganizationsHandler from "@apps/desktop/routes/handlers/organizations";
import OrganizationsLanding from "@apps/desktop/routes/handlers/organizations-landing";



export const Routes = () => (
  <$Routes>

    {/* Root Layout */}
    <Route path={"/"} element={<RootLayout />}>

      <Route index element={<Landing />} />

      <Route path={"/auth"}>
        <Route path={"/auth/login"} element={<LoginPage />} />
        <Route path={"/auth/callback"} element={<AuthCallback />} />
      </Route>

      <Route path={"/organizations"} element={<OrganizationsHandler />} />
      <Route path={"/organizations/:organizationID"}>
        <Route index element={<OrganizationsLanding />} />
      </Route>

    </Route>
  </$Routes>
);