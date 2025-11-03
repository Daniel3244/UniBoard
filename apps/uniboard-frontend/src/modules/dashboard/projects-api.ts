import { useCallback } from "react";
import { apiClient } from "../shared/api-client";
import { useAuthContext } from "../auth/AuthContext";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export const useProjectsApi = () => {
  const {
    auth: { accessToken },
  } = useAuthContext();

  const getProjects = useCallback(
    () => apiClient.get<Project[]>("/api/projects", accessToken ?? undefined),
    [accessToken],
  );

  return { getProjects };
};
