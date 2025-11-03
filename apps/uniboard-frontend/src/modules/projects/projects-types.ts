export type TaskStatus = "todo" | "in_progress" | "done";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type CreateTaskPayload = {
  title: string;
  status: TaskStatus;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];
