import { useState } from "react";
import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import type { CreateTaskPayload } from "../projects-types";

type TaskFormProps = {
  onSubmit: (payload: CreateTaskPayload) => Promise<void> | void;
  isSubmitting: boolean;
  error?: string;
};

const statusOptions: CreateTaskPayload["status"][] = [
  "Todo",
  "In Progress",
  "Done",
];

export const TaskForm = ({ onSubmit, isSubmitting, error }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<CreateTaskPayload["status"]>(
    statusOptions[0],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    await onSubmit({ title: title.trim(), status });
    setTitle("");
    setStatus(statusOptions[0]);
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <TextField
        label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <TextField
        select
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value as CreateTaskPayload["status"])}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add task"}
      </Button>
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );
};
