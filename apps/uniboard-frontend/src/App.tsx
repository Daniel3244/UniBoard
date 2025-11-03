import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./modules/auth/LoginPage";
import { RegisterPage } from "./modules/auth/RegisterPage";
import { ProjectsDashboardPage } from "./modules/projects/ProjectsDashboardPage";
import { Layout } from "./modules/shared/Layout";
import { ProtectedRoute } from "./modules/shared/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProjectsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectsDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
