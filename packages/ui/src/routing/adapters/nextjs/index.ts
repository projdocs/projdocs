import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RouterAdapter } from "@packages/ui/routing";



export function useNextAdapter(): RouterAdapter {
  const router = useRouter();
  return {
    Link,
    navigate: (href, opts) => opts?.replace ? router.replace(href) : router.push(href),
    usePathname,
    useSearchParams: () => useSearchParams() as unknown as URLSearchParams,
    refresh: router.refresh,
  };
}