import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Project } from "../projects-types";
import type {
  ProjectsQueryResult,
  CreateProjectMutationResult,
  DeleteProjectMutationResult,
} from "../projects-hooks";

const sortProjects = (projects: Project[]) =>
  [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

type ProjectsListProps = {
  projectsQuery: ProjectsQueryResult;
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  createProjectMutation: CreateProjectMutationResult;
  deleteProjectMutation: DeleteProjectMutationResult;
};

export const ProjectsList = ({
  projectsQuery,
  projects,
  selectedProjectId,
  onSelect,
  createProjectMutation,
  deleteProjectMutation,
}: ProjectsListProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const sortedProjects = useMemo(() => sortProjects(projects), [projects]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const project = await createProjectMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName("");
      setDescription("");
      onSelect(project.id);
    } catch {
      // Error is handled by mutation state rendering below.
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create new projects or pick an existing one to inspect tasks.
            </Typography>
          </Box>

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <TextField
              label="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              rows={2}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creating..." : "Add project"}
            </Button>
            {createProjectMutation.isError ? (
              <Alert severity="error">
                {(createProjectMutation.error as Error)?.message ??
                  "Unable to create project."}
              </Alert>
            ) : null}
          </Stack>

          <Divider />

          {projectsQuery.isPending ? (
            <Typography color="text.secondary">Loading projects...</Typography>
          ) : projectsQuery.isError ? (
            <Alert severity="error">
              {(projectsQuery.error as Error)?.message ??
                "Unable to load projects."}
            </Alert>
          ) : sortedProjects.length === 0 ? (
            <Alert severity="info">No projects yet. Create your first one.</Alert>
          ) : (
            <List>
              {sortedProjects.map((project) => (
                <ListItem
                  key={project.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteProjectMutation.mutate(project.id)}
                      disabled={deleteProjectMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={project.id === selectedProjectId}
                    onClick={() => onSelect(project.id)}
                  >
                    <ListItemText
                      primary={project.name}
                      secondary={project.description}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {deleteProjectMutation.isError ? (
            <Alert severity="error">
              {(deleteProjectMutation.error as Error)?.message ??
                "Unable to delete project."}
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
