import {
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import type { Project } from "../projects-types";
import type {
  TasksQueryResult,
  CreateTaskMutationResult,
  UpdateTaskMutationResult,
  DeleteTaskMutationResult,
} from "../projects-hooks";
import { TasksList } from "./TasksList";
import { TaskForm } from "./TaskForm";
import { useState } from "react";

const tabs = [
  { value: "tasks", label: "Tasks" },
  { value: "create", label: "Add task" },
];

type ProjectTasksPaneProps = {
  project: Project | null;
  tasksQuery: TasksQueryResult;
  createTaskMutation: CreateTaskMutationResult;
  updateTaskMutation: UpdateTaskMutationResult;
  deleteTaskMutation: DeleteTaskMutationResult;
};

export const ProjectTasksPane = ({
  project,
  tasksQuery,
  createTaskMutation,
  updateTaskMutation,
  deleteTaskMutation,
}: ProjectTasksPaneProps) => {
  const [tab, setTab] = useState("tasks");

  if (!project) {
    return (
      <Card>
        <CardContent>
          <Typography>Select a project to see its tasks.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {project.description ?? "No description provided."}
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ mb: 3 }}
        >
          {tabs.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>

        {tab === "tasks" ? (
          <TasksList
            tasksQuery={tasksQuery}
            onUpdate={(taskId, payload) => updateTaskMutation.mutate({ taskId, payload })}
            onDelete={(taskId) => deleteTaskMutation.mutate(taskId)}
          />
        ) : (
          <TaskForm
            onSubmit={async (payload) => {
              try {
                await createTaskMutation.mutateAsync(payload);
                setTab("tasks");
              } catch {
                // Error surfaced below.
              }
            }}
            isSubmitting={createTaskMutation.isPending}
            error={(createTaskMutation.error as Error)?.message}
          />
        )}

        {updateTaskMutation.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(updateTaskMutation.error as Error)?.message ??
              "Unable to update the task."}
          </Alert>
        ) : null}

        {deleteTaskMutation.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteTaskMutation.error as Error)?.message ??
              "Unable to delete the task."}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};
