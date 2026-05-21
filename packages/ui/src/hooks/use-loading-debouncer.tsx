import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";



export const useLoadingDebouncer = (initialState: boolean, delay: number = 1000): [
  boolean,
  Dispatch<SetStateAction<boolean>>
] => {

  const [ state, setState ] = useState<boolean>(initialState);
  const [ debounced, setDebounced ] = useState(initialState);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (state) setDebounced(state); // immediately fire loading
    else timeout.current = setTimeout(() => setDebounced(state), delay); // delay
  }, [ state ]);

  return [
    debounced,
    setState,
  ];

};