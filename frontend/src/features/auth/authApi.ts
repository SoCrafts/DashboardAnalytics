import { apiClient } from "@/shared/apiClient";

export type RegisterPayload = { username: string; email: string; password: string };
export type LoginPayload = { email: string; password: string };

export const register = (data: RegisterPayload) =>
  apiClient.post("/auth/register", {
    Username: data.username,
    Email: data.email,
    Password: data.password,
  });

export const login = (data: LoginPayload) =>
  apiClient.post<{ token: string }>("/auth/login", {
    Email: data.email,
    Password: data.password,
  });