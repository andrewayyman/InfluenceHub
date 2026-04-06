import { apiRequest } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const applyForCampaign = (token, data, signal) =>
  apiRequest("/api/Applications", withToken(token, {
    method: "POST",
    body: data,
    signal,
  }));

export const acceptOrRejectApplication = (token, data, signal) =>
  apiRequest("/api/Applications", withToken(token, {
    method: "PATCH",
    body: data,
    signal,
  }));

export const getCampaignApplications = (token, campaignId, signal) =>
  apiRequest(`/api/Applications/${campaignId}`, withToken(token, { signal }));
