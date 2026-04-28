import { useState } from "react";

export const useDrag = () => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const startDrag = (id: string) => (e: React.MouseEvent) => {
    setDraggingId(id);
    setPosition({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", stopDrag);
  };

  const onMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const stopDrag = () => {
    setDraggingId(null);
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", stopDrag);
  };

  return {
    draggingId,
    position,
    startDrag,
  };
};