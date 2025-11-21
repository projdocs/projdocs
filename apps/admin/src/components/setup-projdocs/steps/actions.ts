"use server";

import axios from "axios";
import { SetupProjDocsState } from "@workspace/admin/components/setup-projdocs/store.ts";
import { Client } from "pg";



export const testDbConnection = async (
  db: SetupProjDocsState["database"]
): Promise<{ success: boolean; error?: string }> => {
  const { host, port, database, username, password, mode } = db;

  // Self-hosted mode doesn't test remote PG
  if (mode === "self-hosted") {
    return { success: true };
  }

  const client = new Client({
    host,
    port: parseInt(port, 10),
    database,
    user: username,
    password,
    ssl: false, // If you want SSL: { rejectUnauthorized: false }
    connectionTimeoutMillis: 3000,
  });

  try {
    await client.connect();
    await client.query("SELECT 1;");
    await client.end();
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      error: err?.message ?? "Unknown connection error",
    };
  }
};

export const testCloudflareToken = async (props: {
  value: string;
}): Promise<{
  succeeded: boolean;
  active: boolean;
  valid: boolean;
}> => {
  const endpoint = "https://api.cloudflare.com/client/v4/user/tokens/verify";
  const result = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${props.value}` },
    validateStatus: () => true,
  });

  if (result.status !== 200) return {
    succeeded: false,
    active: false,
    valid: false
  };

  const details = await axios.get(`https://api.cloudflare.com/client/v4/user/tokens/${result.data.result.id}`, {
    headers: { Authorization: `Bearer ${props.value}` },
    validateStatus: () => true,
  });

  const validatedPolicy = details.data?.result?.policies?.find((policy: any) => policy?.permission_groups?.find((group: any) => group?.name === "DNS Write"));

  return {
    succeeded: result.status === 200,
    active: result.data?.result?.status === "active",
    valid: !!validatedPolicy,
  };
};