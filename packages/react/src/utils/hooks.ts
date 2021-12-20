import { useCallback, useEffect, useRef, useState } from 'react';

export function useRequestReRender() {
  const [, setUpdateCounter] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const requestReRender = useCallback((immediately = false) => {
    if (animationFrameRef.current && !immediately) {
      return;
    }

    if (immediately) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setUpdateCounter((state) => state + 1);
        animationFrameRef.current = null;
      });
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setUpdateCounter((state) => state + 1);
  }, []);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  });

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  return requestReRender;
}
