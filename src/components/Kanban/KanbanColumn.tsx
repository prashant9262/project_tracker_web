// src/components/Kanban/KanbanColumn.tsx

import { Task, TaskStatus } from "../../types";
import TaskCard from "../TaskCard";

interface Props {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDropTask: (taskId: string, status: TaskStatus) => void;
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  onDropTask,
}: Props) {
  return (
    <div
      className="bg-gray-100 rounded-lg p-3 h-full flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("taskId");
        onDropTask(taskId, status);
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">{title}</h2>
        <span className="text-sm bg-gray-300 px-2 rounded">
          {tasks.length}
        </span>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No tasks here 🚀
        </div>
      )}

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}