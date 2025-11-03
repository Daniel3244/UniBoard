import { useEffect, useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { ActivityTimeline } from "../activity/ActivityTimeline";
import { useActivityStream } from "../activity/useActivityStream";
import { ProjectsList } from "./components/ProjectsList";
import { ProjectTasksPane } from "./components/ProjectTasksPane";
import { useProjectsQueries } from "./projects-hooks";
import { useProjectsStore } from "./store";

export const ProjectsDashboardPage = () => {
  const { auth } = useAuthContext();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const selectedProjectId = useProjectsStore((state) => state.selectedProjectId);
  const selectProject = useProjectsStore((state) => state.selectProject);

  const {
    projectsQuery,
    tasksQuery,
    projects,
    createProjectMutation,
    deleteProjectMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  } = useProjectsQueries(selectedProjectId ?? undefined);
  useActivityStream();

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  useEffect(() => {
    const normalized = projectId ?? null;
    if (selectedProjectId !== normalized) {
      selectProject(normalized);
    }
  }, [projectId, selectedProjectId, selectProject]);

  useEffect(() => {
    if (selectedProjectId && !selectedProject) {
      selectProject(null);
      navigate("/dashboard", { replace: true });
    }
  }, [selectedProjectId, selectedProject, navigate, selectProject]);

  const handleProjectSelect = (id: string | null) => {
    const normalized = id ?? null;
    if (selectedProjectId !== normalized) {
      selectProject(normalized);
    }

    navigate(normalized ? `/projects/${normalized}` : "/dashboard", {
      replace: true,
    });
  };

  return (
    <Stack spacing={4} sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Welcome, {auth.email}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage UniBoard projects and their tasks from this dashboard.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
        alignItems="flex-start"
      >
        <Box sx={{ flex: 1, minWidth: 320, width: "100%" }}>
          <ProjectsList
            projectsQuery={projectsQuery}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={handleProjectSelect}
            createProjectMutation={createProjectMutation}
            deleteProjectMutation={deleteProjectMutation}
          />
        </Box>
        <Box sx={{ flex: 2, width: "100%" }}>
          <ProjectTasksPane
            project={selectedProject}
            tasksQuery={tasksQuery}
            createTaskMutation={createTaskMutation}
            updateTaskMutation={updateTaskMutation}
            deleteTaskMutation={deleteTaskMutation}
          />
        </Box>
      </Stack>

      <ActivityTimeline />
    </Stack>
  );
};
