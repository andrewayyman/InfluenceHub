import { apiRequest } from "./client";

export const getTags = (token, signal) =>
  apiRequest("/api/Tags/GetTags", { method: "GET", token, signal });

export const createTag = (token, data, signal) =>
  apiRequest("/api/Tags/CreateTag", {
    method: "POST",
    body: data,
    token,
    signal,
  });
