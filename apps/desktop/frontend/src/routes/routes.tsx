import { Route, Routes as $Routes } from "react-router-dom";
import Landing from "@apps/desktop/routes/handlers/landing";
import LoginPage from "@apps/desktop/routes/handlers/auth-login";
import RootLayout from "@apps/desktop/routes/layouts";
import AuthCallback from "@apps/desktop/routes/handlers/auth-callback";
import OrganizationsHandler from "@apps/desktop/routes/handlers/organizations";
import OrganizationsLanding from "@apps/desktop/routes/handlers/organizations-landing";
import { OrganizationsLayout } from "@apps/desktop/routes/layouts/organizations-layout";
import { H2 } from "@packages/ui/components/typography";
import { Button } from "@packages/ui/components/button";
import { useNavigate } from "react-router";
import AuthLogout from "@apps/desktop/routes/handlers/auth-logout";



export const Routes = () => (
  <$Routes>

    {/* Root Layout */}
    <Route path={"/"} element={<RootLayout />}>

      <Route index element={<Landing />} />

      <Route path={"/auth"}>
        <Route path={"/auth/login"} element={<LoginPage />} />
        <Route path={"/auth/callback"} element={<AuthCallback />} />
        <Route path={"/auth/logout"} element={<AuthLogout />} />
      </Route>

      <Route path={"/organizations"} element={<OrganizationsHandler />} />
      <Route path={"/organizations/:organizationID"} element={<OrganizationsLayout />}>
        <Route index element={<OrganizationsLanding />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </$Routes>
);

const NotFound = () => {

  const navigate = useNavigate();

  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <H2>{"Uh, oh..."}</H2>
      <p>{"The route you requested was not found."}</p>
      <Button className={"mt-4 w-20"} variant={"secondary"} onClick={() => navigate(-1)}>{"Back"}</Button>
    </div>
  );
};