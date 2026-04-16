"use client";

import { useCallback, useEffect, useRef } from "react";



export function useEventListener<TDetail = void>(
  eventName: string,
  handler: (detail: TDetail) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    function listener(event: Event) {
      const custom = event as CustomEvent<TDetail>;
      handlerRef.current(custom.detail);
    }

    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [ eventName ]);

  return useCallback((detail: TDetail) => window.dispatchEvent(new CustomEvent<TDetail>(eventName, { detail })), [ eventName ]);
}

useEventListener.RemoteDispatch = <TDetail>(eventName: string, detail: TDetail) => {
  window.dispatchEvent(new CustomEvent<TDetail>(eventName, { detail }));
}