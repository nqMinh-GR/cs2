import { useLayoutEffect, useState, type RefObject } from 'react';

/** Number of columns the browser resolved for a CSS grid (`repeat(auto-fill, …)`), tracked on resize. */
export function useGridColumns(ref: RefObject<HTMLElement | null>, fallback = 6) {
  const [columns, setColumns] = useState(fallback);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const template = getComputedStyle(element).gridTemplateColumns;
      const count = template && template !== 'none' ? template.split(' ').filter(Boolean).length : fallback;
      setColumns((current) => (current === count ? current : count));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, fallback]);
  return columns;
}
