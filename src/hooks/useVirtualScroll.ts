import { useState, useRef } from "react";
export const useVirtualScroll = (itemHeight: number, total: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = 10;
  const start = Math.floor(scrollTop / itemHeight);
  const end = start + visibleCount;

  const onScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  return {
    containerRef,
    start,
    end,
    onScroll,
    totalHeight: total * itemHeight,
  };
};