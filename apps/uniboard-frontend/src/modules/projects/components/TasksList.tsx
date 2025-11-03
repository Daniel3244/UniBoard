import {
  Alert,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import type { TasksQueryResult } from "../projects-hooks";
import {
  TASK_STATUS_OPTIONS,
  type TaskStatus,
  type UpdateTaskPayload,
} from "../projects-types";

const statusColors: Record<TaskStatus, "default" | "success" | "warning" | "info"> =
  {
    todo: "info",
    in_progress: "warning",
    done: "success",
  };

type TasksListProps = {
  tasksQuery: TasksQueryResult;
  onUpdate: (taskId: string, payload: UpdateTaskPayload) => void;
  onDelete: (taskId: string) => void;
};

export const TasksList = ({ tasksQuery, onUpdate, onDelete }: TasksListProps) => {
  const tasks = tasksQuery.data ?? [];

  if (tasksQuery.isPending) {
    return <Typography color="text.secondary">Loading tasks...</Typography>;
  }

  if (tasksQuery.isError) {
    return (
      <Alert severity="error">
        {(tasksQuery.error as Error)?.message ?? "Unable to load tasks."}
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return <Alert severity="info">No tasks yet.</Alert>;
  }

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          secondaryAction={
            <IconButton edge="end" onClick={() => onDelete(task.id)}>
              <DeleteIcon />
            </IconButton>
          }
          sx={{ gap: 2, alignItems: "flex-start" }}
        >
          <ListItemText
            primary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography fontWeight={600}>{task.title}</Typography>
                <Chip
                  label={
                    TASK_STATUS_OPTIONS.find((option) => option.value === task.status)
                      ?.label ?? task.status
                  }
                  color={statusColors[task.status] ?? "default"}
                />
              </Box>
            }
            secondary={`Created: ${dayjs(task.createdAt).format(
              "YYYY-MM-DD HH:mm",
            )}`}
          />
          <Select
            size="small"
            value={task.status}
            onChange={(event) =>
              onUpdate(task.id, {
                status: event.target.value as TaskStatus,
              })
            }
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
      ))}
    </List>
  );
};
