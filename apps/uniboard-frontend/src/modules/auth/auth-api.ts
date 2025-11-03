import { apiClient } from "../shared/api-client";
import type {
  AuthenticationResponse,
  LoginPayload,
  RegisterPayload,
} from "./auth-types";

export const registerRequest = async (
  payload: RegisterPayload,
): Promise<AuthenticationResponse> => {
  const response = await apiClient.post<AuthenticationResponse>(
    "/api/auth/register",
    payload,
  );
  return response;
};

export const loginRequest = async (
  payload: LoginPayload,
): Promise<AuthenticationResponse> => {
  const response = await apiClient.post<AuthenticationResponse>(
    "/api/auth/login",
    payload,
  );
  return response;
};
