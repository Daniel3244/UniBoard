import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { Comment } from "../task-comments-types";
import type { Task } from "../projects-types";

const formatTimestamp = (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm");

type TaskCommentsPanelProps = {
  projectId: string | null;
  task: Task | null;
  commentsQuery: UseQueryResult<Comment[], Error>;
  createCommentMutation: UseMutationResult<Comment, Error, string>;
};

export const TaskCommentsPanel = ({
  projectId,
  task,
  commentsQuery,
  createCommentMutation,
}: TaskCommentsPanelProps) => {
  const [commentBody, setCommentBody] = useState("");

  const comments = commentsQuery.data ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync(trimmed);
      setCommentBody("");
    } catch {
      // handled by mutation state UI
    }
  };

  const header = useMemo(() => {
    if (!task) {
      return "Wybierz zadanie, aby wyświetlić komentarze.";
    }
    return `Komentarze dla: ${task.title}`;
  }, [task]);

  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {header}
            </Typography>
            {task ? (
              <Typography variant="body2" color="text.secondary">
                Projekt: {projectId ?? "brak"}
              </Typography>
            ) : null}
          </Box>

          {task ? (
            <Stack component="form" onSubmit={handleSubmit} spacing={2}>
              <TextField
                label="Dodaj komentarz"
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                multiline
                minRows={2}
                disabled={createCommentMutation.isPending}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={createCommentMutation.isPending}
              >
                {createCommentMutation.isPending ? "Dodawanie..." : "Dodaj komentarz"}
              </Button>
              {createCommentMutation.isError ? (
                <Alert severity="error">
                  {createCommentMutation.error.message ?? "Nie udało się dodać komentarza."}
                </Alert>
              ) : null}
            </Stack>
          ) : null}

          {commentsQuery.isPending ? (
            <Typography color="text.secondary">Ładowanie komentarzy...</Typography>
          ) : commentsQuery.isError ? (
            <Alert severity="error">
              {commentsQuery.error.message ?? "Nie udało się pobrać komentarzy."}
            </Alert>
          ) : comments.length === 0 ? (
            <Alert severity="info">Brak komentarzy.</Alert>
          ) : (
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start">
                  <ListItemText
                    primary={comment.body}
                    secondary={`${comment.authorEmail} • ${formatTimestamp(comment.createdAt)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
