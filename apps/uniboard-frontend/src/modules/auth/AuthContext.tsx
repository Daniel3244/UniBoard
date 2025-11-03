import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "./auth-api";
import type {
  AuthenticationResponse,
  LoginPayload,
  RegisterPayload,
} from "./auth-types";

type AuthState = {
  user: AuthenticationResponse["userId"] | null;
  email: string | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
};

type AuthContextValue = {
  auth: AuthState;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "uniboard-auth";

const defaultState: AuthState = {
  user: null,
  email: null,
  role: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultState;
    }
    try {
      return JSON.parse(stored) as AuthState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const handleAuthSuccess = (response: AuthenticationResponse) => {
    setAuth({
      user: response.userId,
      email: response.email,
      role: response.role,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt,
    });
    navigate("/dashboard", { replace: true });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.accessToken),
      login: async (payload) => {
        const response = await loginRequest(payload);
        handleAuthSuccess(response);
      },
      register: async (payload) => {
        const response = await registerRequest(payload);
        handleAuthSuccess(response);
      },
      logout: () => {
        setAuth(defaultState);
        localStorage.removeItem(STORAGE_KEY);
        navigate("/login");
      },
    }),
    [auth, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};
