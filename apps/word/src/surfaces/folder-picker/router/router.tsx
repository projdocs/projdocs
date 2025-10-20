// router.tsx
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@workspace/word/store/app";



/** Turn "/dashboard/[id]" into a named-capture RegExp */
function patternToRegex(pattern: string): RegExp {
  // remove trailing slash (except root)
  const norm = pattern === "/" ? "/" : pattern.replace(/\/+$/, "");
  // escape regex chars, then replace [param] with named group
  const rx = norm
    .replace(/[-/\\^$*+?.()|[\]{}]/g, (m) => (m === "/" ? "/" : `\\${m}`))
    .replace(/\\\[([a-zA-Z_][a-zA-Z0-9_]*)\\\]/g, (_, name) => `(?<${name}>[^/]+)`);
  return new RegExp(`^${rx}$`);
}

/** Match a path against a pattern like "/dashboard/[id]" */
export function matchPath(pattern: string, path: string) {
  const re = patternToRegex(pattern);
  const m = re.exec(path);
  if (!m) return { matched: false as const, params: {} as Record<string, string> };
  const groups = (m.groups || {}) as Record<string, string>;
  return { matched: true as const, params: groups };
}

/** Hook: current path (hash-based) */
export function usePathname() {
  const { state } = useAppStore();
  const [ path, setPath ] = useState<string>(() => state.router.path);
  useEffect(() => {
    setPath(state.router.path);
  }, [ state.router.path ]);
  return path;
}

/** Hook: match current route */
export function useRoute(pattern: string) {
  const path = usePathname();
  return useMemo(() => {
    const { matched, params } = matchPath(pattern, path);
    return { path, matched, params };
  }, [ pattern, path ]);
}

/** Router just renders children; Route handles matching */
export function Router({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Route component */
export function Route<T extends Record<string, string> = Record<string, string>>(props: {
  pattern: string;
  children?: ReactNode;
}) {
  const {
    matched,
    // params,
    // path
  } = useRoute(props.pattern);
  if (!matched) return null;
  return props.children;
}