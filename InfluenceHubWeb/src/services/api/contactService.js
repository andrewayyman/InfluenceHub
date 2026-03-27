import { apiRequest } from "./client";

export const createContactMessage = (payload, signal) => apiRequest("/api/contact/contact", {
  method: "POST",
  body: payload,
  signal,
});
