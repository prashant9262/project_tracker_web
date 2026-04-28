import { useTaskStore } from "../../store/useTaskStore";
import { useVirtualScroll } from "../../hooks/useVirtualScroll";

export default function ListView() {
  const { tasks } = useTaskStore();

  const { containerRef, start, end, onScroll, totalHeight } =
    useVirtualScroll(60, tasks.length);

  const visible = tasks.slice(start, end);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="h-full overflow-auto"
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${start * 60}px)` }}>
          {visible.map((t) => (
            <div key={t.id} className="p-3 border-b">
              {t.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}