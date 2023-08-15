import { useEffect, useRef } from 'react';

// https://stackoverflow.com/a/61127960/12948018
export function useDebouncedEffect(effect: () => any, deps: any[], delay: number) {
  let cleanupRef = useRef<() => any>();

  useEffect(() => {
    const handler = setTimeout(() => {
      cleanupRef.current = effect();
    }, delay);

    return () => {
      clearTimeout(handler);

      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
