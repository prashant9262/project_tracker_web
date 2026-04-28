// src/components/Kanban/KanbanBoard.tsx

import { useTaskStore } from "../../store/useTaskStore";
import TaskCard from "../TaskCard";
import { TaskStatus } from "../../types";

const columns: TaskStatus[] = ["todo", "inProgress", "inReview", "done"];

export default function KanbanBoard() {
  const { tasks, moveTaskToStatus, filters } = useTaskStore();

  const filteredTasks = tasks.filter((t) => {
    if (filters.statuses.length && !filters.statuses.includes(t.status))
      return false;
    return true;
  });

  return (
    <div className="grid grid-cols-4 gap-4 p-4 h-full">
      {columns.map((col) => {
        const colTasks = filteredTasks.filter(
          (t) => t.status === col
        );

        return (
          <div
            key={col}
            className="bg-gray-100 p-2 rounded overflow-y-auto"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("taskId");
              moveTaskToStatus(id, col);
            }}
          >
            <h2 className="font-bold mb-2">
              {col} ({colTasks.length})
            </h2>

            {colTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        );
      })}
    </div>
  );
}