export type TaskStatus = "Todo" | "In Progress" | "Done";

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
