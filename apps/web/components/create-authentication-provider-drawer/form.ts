import { z } from "zod";



const RESERVED_AUTH_PARAMS = new Set([
  "client_id",
  "client_secret",
  "redirect_uri",
  "response_type",
  "state",
  "code_challenge",
  "code_challenge_method",
  "code_verifier",
  "nonce",
]);

const authorizationParamsSchema = z
  .record(z.string(), z.string())
  .refine(
    (params) => !Object.keys(params).some((k) => RESERVED_AUTH_PARAMS.has(k)),
    {
      message: `Authorization params must not include reserved keys: ${[ ...RESERVED_AUTH_PARAMS ].join(", ")}`,
    },
  )
  .optional();

/** Fields shared by both provider types. */
const baseProviderFields = {
  name: z.string().min(1, "Provider name is required"),
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client Secret is required"),
  scopes: z.array(z.string()).optional(),
  pkce_enabled: z.boolean().default(true),
  email_optional: z.boolean().default(false),
  acceptable_client_ids: z.array(z.string()).optional(),
  authorization_params: authorizationParamsSchema,
};

export const oauth2ProviderSchema = z.object({
  provider_type: z.literal("oauth2"),
  ...baseProviderFields,
  authorization_url: z.url("Authorization URL must be a valid URL"),
  token_url: z.url("Token URL must be a valid URL"),
  user_info_url: z.url("UserInfo URL must be a valid URL"),
});

export type OAuth2ProviderFormValues = z.infer<typeof oauth2ProviderSchema>;

export const oidcProviderSchema = z.object({
  provider_type: z.literal("oidc"),
  ...baseProviderFields,
  issuer: z.url("Issuer must be a valid URL"),
  discovery_url: z.url("Discovery URL must be a valid URL").optional(),
  skip_nonce_check: z.boolean().default(false),
});

export type OIDCProviderFormValues = z.infer<typeof oidcProviderSchema>;

export const customProviderSchema = z.discriminatedUnion("provider_type", [
  oauth2ProviderSchema,
  oidcProviderSchema,
]);

export type CustomProviderFormValues = z.infer<typeof customProviderSchema>;