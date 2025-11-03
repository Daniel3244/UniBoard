import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuthContext } from "./AuthContext";

export const LoginPage = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się zalogować.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Card sx={{ width: 400, maxWidth: "90%" }} elevation={4}>
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Zaloguj się
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Użyj danych z backendu UniBoard, aby przejść do panelu.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Adres e-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Hasło"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logowanie..." : "Zaloguj"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
