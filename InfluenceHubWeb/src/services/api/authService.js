import { apiRequest } from "./client";

export const login = (payload, signal) => apiRequest("/api/auth/login", {
  method: "POST",
  body: payload,
  signal,
});

export const register = (payload, signal) => apiRequest("/api/auth/register", {
  method: "POST",
  body: payload,
  signal,
});
