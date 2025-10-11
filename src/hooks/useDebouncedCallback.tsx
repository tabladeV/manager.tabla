import { useEffect, useRef, useCallback } from 'react';

/**
 * Creates a debounced version of a callback that is stable across re-renders.
 * @param callback The function to debounce.
 * @param delay The number of milliseconds to delay.
 * @returns A debounced version of the callback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update the callback reference whenever it changes.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup the timeout on component unmount.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear the previous timeout if it exists.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout.
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedCallback;
}