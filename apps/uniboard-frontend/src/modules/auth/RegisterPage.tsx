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

export const RegisterPage = () => {
  const { register } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Hasła muszą być identyczne.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password, confirmPassword });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się zarejestrować.";
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
                Załóż konto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejestracja utworzy użytkownika w backendzie UniBoard.
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
              helperText="Minimum 8 znaków, zgodnie z walidacją backendu."
            />
            <TextField
              label="Powtórz hasło"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rejestrowanie..." : "Zarejestruj"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
