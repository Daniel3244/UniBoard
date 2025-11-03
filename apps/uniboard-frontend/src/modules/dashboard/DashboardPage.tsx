import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useProjectsApi, type Project } from "./projects-api";
import { useAuthContext } from "../auth/AuthContext";

export const DashboardPage = () => {
  const { auth } = useAuthContext();
  const { getProjects } = useProjectsApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getProjects();
        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : "Nie udało się pobrać projektów.";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [getProjects]);

  return (
    <Stack spacing={4} sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Witaj, {auth.email}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Poniżej znajdziesz projekty dostępne w UniBoard. Ten frontend korzysta
          z API wygenerowanego w tygodniu 4.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : projects.length === 0 ? (
        <Alert severity="info">
          Brak projektów w systemie. Dodaj je przez backend lub klienta API.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description ?? "Brak opisu projektu."}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Utworzono: {dayjs(project.createdAt).format("YYYY-MM-DD HH:mm")}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  );
};
