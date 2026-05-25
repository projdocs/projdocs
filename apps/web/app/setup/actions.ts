
const isApiResponse = (o: unknown) => {
  if (typeof o !== "object" || o === null) return false;
  if (!("data" in o) || !("error" in o)) return false;
  if (typeof o.error !== "string" && o.error !== null) return false;
  return true;
}

export type GetProvidersResult = ReturnType<typeof getProviders>;

export const getProviders = async (api: string): Promise<{
  data: ReadonlyArray<{
    id: string;
    identifier: string;
    display: string;
  }>;
  error: null
} | {
  data: null;
  error: string;
}> => {
  try {
    const request = await fetch(`${api}/public/auth/providers`, {
      method: "GET",
    });
    const response = await request.json();

    console.log(response);

    if (isApiResponse(response)) return response;
    return {
      data: null,
      error: "Unable to fetch authentication providers!",
    }
  } catch (error) {
    return {
      data: null,
      error: "Unable to fetch authentication providers!",
    }
  }
};