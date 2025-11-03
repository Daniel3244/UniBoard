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
import type { TaskStatus, UpdateTaskPayload } from "../projects-types";

const statusColors: Record<TaskStatus, "default" | "success" | "warning" | "info"> = {
  Todo: "info",
  "In Progress": "warning",
  Done: "success",
};

const statusOptions: TaskStatus[] = ["Todo", "In Progress", "Done"];

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
                  label={task.status}
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
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </ListItem>
      ))}
    </List>
  );
};
