import { useCallback, useRef, useState } from "react";



export type UseOncelerOptions<T> = {
  onUnhandledError?: (error: unknown) => void;
};

export function useOnceler<T>(
  action: (signal: AbortSignal) => Promise<T>,
  onResult: (result: T) => void,
  options?: UseOncelerOptions<T>
) {
  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const [ running, setRunning ] = useState(false);

  const doOnce = useCallback((): void => {
    // fire-and-forget async wrapper
    (async () => {
      // Abort any in-flight run
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const runId = ++runIdRef.current;
      setRunning(true);

      try {
        const result = await action(controller.signal);

        // Ignore stale runs
        if (runId !== runIdRef.current) return;

        onResult(result);
      } catch (err) {
        // Ignore abort errors
        if (controller.signal.aborted) return;

        if (options?.onUnhandledError) options.onUnhandledError(err);
        else console.error(err);
      } finally {
        if (runId === runIdRef.current) {
          setRunning(false);
        }
      }
    })();
  }, [action, options]);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRunning(false);
  }, []);

  return {
    do: doOnce,
    abort,
    running,
  };
}