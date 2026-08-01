import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DELAY_MS = 300;

/**
 * Boolean loading state where turning ON is immediate but turning OFF is
 * delayed, to avoid flicker when a loading state toggles on and off rapidly.
 */
export function useLoadingState(
  delayMs: number = DEFAULT_DELAY_MS
): [boolean, (loading: boolean) => void] {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setLoading = useCallback(
    (loading: boolean) => {
      clearPendingTimeout();

      if (loading) {
        setIsLoading(true);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        timeoutRef.current = null;
      }, delayMs);
    },
    [clearPendingTimeout, delayMs]
  );

  useEffect(() => clearPendingTimeout, [clearPendingTimeout]);

  return [isLoading, setLoading];
}