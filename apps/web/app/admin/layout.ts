import { LayoutProps } from "@/lib/types/layout"
import * as process from "node:process"
import { DisplayableError } from "@/lib/types/displayable-error"

export default function ({ children }: LayoutProps) {
  if (process.env.ENABLE_PROJDOCS_ADMIN !== "1")
    throw new DisplayableError("Admin Not Enabled", `runtime environment variable ENABLE_PROJDOCS_ADMIN is not configured properly (expected: '1', got: '${process.env.ENABLE_PROJDOCS_ADMIN}'`).toError()

  return children
}
