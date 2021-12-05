export function throttleAnimationFrame(fn: () => void) {
  let animationFrameId: number | null = null;

  const run = () => {
    if (animationFrameId) {
      return;
    }

    animationFrameId = requestAnimationFrame(() => {
      fn();
      animationFrameId = null;
    });
  };

  run.cancel = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  return run;
}
