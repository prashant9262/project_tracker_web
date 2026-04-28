import { useMemo } from 'react';

interface VirtualArgs {
  itemCount: number;
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
  overscan?: number;
}

export function useVirtualList({
  itemCount,
  rowHeight,
  scrollTop,
  viewportHeight,
  overscan = 8
}: VirtualArgs) {
  return useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(
      itemCount,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan
    );

    const topPadding = start * rowHeight;
    const totalHeight = itemCount * rowHeight;
    const visibleCount = end - start;

    return { start, end, topPadding, totalHeight, visibleCount };
  }, [itemCount, overscan, rowHeight, scrollTop, viewportHeight]);
}
