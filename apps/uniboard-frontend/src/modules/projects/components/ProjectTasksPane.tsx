import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { Project, Task } from "../projects-types";
import type {
  TasksQueryResult,
  CreateTaskMutationResult,
  UpdateTaskMutationResult,
  DeleteTaskMutationResult,
} from "../projects-hooks";
import { TasksList } from "./TasksList";
import { TaskForm } from "./TaskForm";
import { TaskCommentsPanel } from "./TaskCommentsPanel";
import { useTaskComments } from "../task-comments-hooks";

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = tasksQuery.data ?? [];

  useEffect(() => {
    if (tab === "tasks" && tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tab, tasks, selectedTaskId]);

  const selectedTask: Task | null = useMemo(() => {
    if (!selectedTaskId) {
      return null;
    }
    return tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [tasks, selectedTaskId]);

  const { commentsQuery, createCommentMutation } = useTaskComments(
    project?.id ?? null,
    selectedTask?.id ?? null,
  );

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
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
            <TasksList
              tasksQuery={tasksQuery}
              onUpdate={(taskId, payload) => updateTaskMutation.mutate({ taskId, payload })}
              onDelete={(taskId) => deleteTaskMutation.mutate(taskId)}
              onSelect={(task) => setSelectedTaskId(task.id)}
              selectedTaskId={selectedTaskId}
            />
            <TaskCommentsPanel
              projectId={project.id}
              task={selectedTask}
              commentsQuery={commentsQuery}
              createCommentMutation={createCommentMutation}
            />
          </Stack>
        ) : (
          <TaskForm
            onSubmit={async (payload) => {
              try {
                const created = await createTaskMutation.mutateAsync(payload);
                setTab("tasks");
                if (created?.id) {
                  setSelectedTaskId(created.id);
                }
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
