import { Task } from "../types";
import dayjs from "dayjs";

export default function TaskCard({ task }: { task: Task }) {
  const overdue = dayjs(task.dueDate).isBefore(dayjs());

  return (
    <div
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData("taskId", task.id)
      }
      className="bg-white p-3 mb-2 rounded shadow"
    >
      <h3>{task.title}</h3>

      <div className="flex justify-between text-sm mt-2">
        <span>{task.assigneeId}</span>
        <span>{task.priority}</span>
      </div>

      <p className={overdue ? "text-red-500" : ""}>
        {overdue ? "Overdue" : dayjs(task.dueDate).format("DD MMM")}
      </p>
    </div>
  );
}