import client from "./client";
import type { User, LoginResponse } from "../types";

export const login = (email: string, password: string) =>
  client.post<LoginResponse>("/api/auth/jwt/create/", { email, password });

export const register = (data: {
  email: string;
  username: string;
  password: string;
  role: string;
  plate_number?: string;
}) => client.post("/api/auth/users/", data);

export const activate = (uid: string, token: string) =>
  client.post("/api/auth/users/activation/", { uid, token });

export const resendActivation = (email: string) =>
  client.post("/api/auth/users/resend_activation/", { email });

export const getMe = () => client.get<User>("/api/auth/users/me/");

export const resetPassword = (email: string) =>
  client.post("/api/auth/users/reset_password/", { email });

export const resetPasswordConfirm = (uid: string, token: string, new_password: string) =>
  client.post("/api/auth/users/reset_password_confirm/", { uid, token, new_password });

export const googleSignup = (token: string) =>
  client.post("/api/users/google/", { token });
