import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../shared/api-client";
import { useAuthContext } from "../auth/AuthContext";
import type { Comment } from "./task-comments-types";

export const buildCommentQueryKey = (projectId: string, taskId: string) => [
  "projects",
  projectId,
  "tasks",
  taskId,
  "comments",
] as const;

export const useTaskComments = (projectId: string | null, taskId: string | null) => {
  const {
    auth: { accessToken },
  } = useAuthContext();
  const token = accessToken ?? undefined;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: projectId && taskId ? buildCommentQueryKey(projectId, taskId) : ["comments"],
    queryFn: async () => {
      if (!projectId || !taskId || !token) {
        throw new Error("Missing identifiers for comments query.");
      }

      return apiClient.get<Comment[]>(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        token,
      );
    },
    enabled: Boolean(projectId && taskId && token),
  });

  const createMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!projectId || !taskId || !token) {
        throw new Error("Missing identifiers for comments mutation.");
      }

      return apiClient.post<Comment>(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        { body },
        token,
      );
    },
    onSuccess: (comment) => {
      if (!projectId || !taskId) {
        return;
      }

      queryClient.setQueryData<Comment[]>(
        buildCommentQueryKey(projectId, taskId),
        (current) => {
          if (!current) {
            return [comment];
          }
          if (current.some((existing) => existing.id === comment.id)) {
            return current;
          }
          return [...current, comment];
        },
      );
    },
  });

  return {
    commentsQuery: query,
    createCommentMutation: createMutation,
  };
};
