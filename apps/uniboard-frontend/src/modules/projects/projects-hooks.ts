import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "../shared/api-client";
import { useAuthContext } from "../auth/AuthContext";
import type {
  CreateProjectPayload,
  CreateTaskPayload,
  Project,
  Task,
  UpdateTaskPayload,
} from "./projects-types";

const PROJECTS_QUERY_KEY = ["projects"] as const;

type UpdateTaskVariables = {
  taskId: string;
  payload: UpdateTaskPayload;
};

export type ProjectsQueryResult = UseQueryResult<Project[], Error>;
export type TasksQueryResult = UseQueryResult<Task[], Error>;
export type CreateProjectMutationResult = UseMutationResult<
  Project,
  Error,
  CreateProjectPayload
>;
export type DeleteProjectMutationResult = UseMutationResult<
  void,
  Error,
  string
>;
export type CreateTaskMutationResult = UseMutationResult<
  Task,
  Error,
  CreateTaskPayload
>;
export type UpdateTaskMutationResult = UseMutationResult<
  void,
  Error,
  UpdateTaskVariables
>;
export type DeleteTaskMutationResult = UseMutationResult<void, Error, string>;

export const useProjectsQueries = (projectId?: string) => {
  const {
    auth: { accessToken },
  } = useAuthContext();
  const token = accessToken ?? undefined;
  const queryClient = useQueryClient();

  const projectsQuery: ProjectsQueryResult = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => apiClient.get<Project[]>("/api/projects", token),
    enabled: Boolean(token),
  });

  const tasksQueryKey = [
    ...PROJECTS_QUERY_KEY,
    projectId ?? "none",
    "tasks",
  ] as const;

  const tasksQuery: TasksQueryResult = useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => {
      if (!projectId) {
        throw new Error("No project selected.");
      }
      return apiClient.get<Task[]>(`/api/projects/${projectId}/tasks`, token);
    },
    enabled: Boolean(projectId && token),
  });

  const invalidateProjects = () =>
    queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });

  const createProjectMutation: CreateProjectMutationResult = useMutation({
    mutationFn: (payload) =>
      apiClient.post<Project>("/api/projects", payload, token),
    onSuccess: () => {
      invalidateProjects();
    },
  });

  const deleteProjectMutation: DeleteProjectMutationResult = useMutation({
    mutationFn: (id) => apiClient.delete<void>(`/api/projects/${id}`, token),
    onSuccess: () => {
      invalidateProjects();
    },
  });

  const createTaskMutation: CreateTaskMutationResult = useMutation({
    mutationFn: (payload) => {
      if (!projectId) {
        throw new Error("No project selected.");
      }
      return apiClient.post<Task>(
        `/api/projects/${projectId}/tasks`,
        payload,
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      invalidateProjects();
    },
  });

  const updateTaskMutation: UpdateTaskMutationResult = useMutation({
    mutationFn: ({ taskId, payload }) => {
      if (!projectId) {
        throw new Error("No project selected.");
      }
      return apiClient.put<void>(
        `/api/projects/${projectId}/tasks/${taskId}`,
        payload,
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      invalidateProjects();
    },
  });

  const deleteTaskMutation: DeleteTaskMutationResult = useMutation({
    mutationFn: (taskId) => {
      if (!projectId) {
        throw new Error("No project selected.");
      }
      return apiClient.delete<void>(
        `/api/projects/${projectId}/tasks/${taskId}`,
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      invalidateProjects();
    },
  });

  const projects = projectsQuery.data ?? [];

  return {
    projectsQuery,
    tasksQuery,
    projects,
    createProjectMutation,
    deleteProjectMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
};
