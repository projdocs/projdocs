import { v4 } from "uuid";

const validProjDocsAdminKey =
  /^pak\-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function register() {
  console.log(`Registering instrumentation`);

  if (validProjDocsAdminKey.test(process.env.__PROJDOCS_ADMIN_API_KEY ?? "")) {
    console.warn(
      "hard-coding __PROJDOCS_ADMIN_API_KEY should only be used in development environments"
    );
  } else {
    process.env.__PROJDOCS_ADMIN_API_KEY = `pak-${v4()}`;
  }

  if (!validProjDocsAdminKey.test(process.env.__PROJDOCS_ADMIN_API_KEY ?? ""))
    throw new Error("failed to register Admin API Key");

  console.log(`Admin API Key: ${process.env.__PROJDOCS_ADMIN_API_KEY}`);
}
