import { ReactNode } from "react"

export type LayoutProps<PathParams extends object = never> = Readonly<{
  children: ReactNode
  params: PathParams
}>
