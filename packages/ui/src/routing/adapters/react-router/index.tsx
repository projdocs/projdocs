import { forwardRef, ReactNode, useMemo } from "react";
import { Link as RRLink, useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router";
import { RouterAdapter } from "@packages/ui/routing";



const LinkBridge = forwardRef<
  HTMLAnchorElement,
  { href: string; children: ReactNode; className?: string }
>(function LinkBridge({ href, ...rest }, ref) {
  return <RRLink ref={ref} to={href} {...rest} />;
});

export function useReactRouterAdapter(): RouterAdapter {
  const navigate = useNavigate();
  const location = useLocation();
  const [ searchParams ] = useRRSearchParams();

  return useMemo(
    () => ({
      Link: LinkBridge,
      navigate: (href, opts) => navigate(href, { replace: opts?.replace }),
      usePathname: () => location.pathname,
      useSearchParams: () => searchParams,
    }),
    [ navigate, location.pathname, searchParams ],
  );
}