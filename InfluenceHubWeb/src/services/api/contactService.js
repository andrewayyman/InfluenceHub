import { apiRequest } from "./client";

export const createContactMessage = (payload, options = {}) => {
  const { signal, token } = options;

  return apiRequest("/api/contact/contact", {
    method: "POST",
    body: payload,
    signal,
    token,
  });
};
