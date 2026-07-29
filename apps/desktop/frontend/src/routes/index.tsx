import { RouteObject } from "react-router-dom";
import Landing from "@apps/desktop/routes/handlers/landing";
import LoginPage from "@apps/desktop/routes/handlers/auth/login";
import RootLayout from "@apps/desktop/routes/layouts";
import AuthCallback from "@apps/desktop/routes/handlers/auth/callback";
import OrganizationsHandler from "@apps/desktop/routes/handlers/organizations";
import { OrganizationsLayout } from "@apps/desktop/routes/layouts/organizations-layout";
import AuthLogout from "@apps/desktop/routes/handlers/auth/logout";
import Routes from "@apps/desktop/routes/route-stubs";
import { NotFound } from "@apps/desktop/routes/handlers/not-found";
import { RootErrorBoundary } from "@apps/desktop/routes/handlers/route-error-boundary";



export default [
  {
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: "auth",
        children: [
          { path: "login", Component: LoginPage },
          { path: "logout", Component: AuthLogout },
          { path: "callback", Component: AuthCallback },
        ],
      },
      {
        path: "organizations",
        children: [
          { index: true, Component: OrganizationsHandler },
          {
            Component: OrganizationsLayout,
            children: [
              {
                path: ":organizationID",
                children: [
                  { index: true, ...Routes.Dashboard },
                  {
                    path: "clients", children: [
                      { index: true, ...Routes.Clients },
                      { path: ":clientID", ...Routes.Client },
                    ],
                  },
                  { path: "clients-favorites", ...Routes.FavoriteClients },
                  {
                    path: "projects", children: [
                      { index: true, ...Routes.Projects },
                      { path: ":projectID", ...Routes.Project },
                    ],
                  },
                  { path: "projects-favorites", ...Routes.FavoriteProjects },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
] satisfies RouteObject[];