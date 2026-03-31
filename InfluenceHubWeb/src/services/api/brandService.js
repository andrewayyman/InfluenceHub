import { apiRequest } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const getBrandProfile = (token, signal) =>
  apiRequest("/api/Brands/GetProfile", withToken(token, { signal }));

export const getBrandCampaigns = (token, signal) =>
  apiRequest("/api/Brands/GetCampaigns", withToken(token, { signal }));
