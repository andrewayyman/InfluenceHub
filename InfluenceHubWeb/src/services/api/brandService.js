import { apiRequest } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const getBrandProfile = (token, signal) =>
  apiRequest("/api/Brands/GetProfile", withToken(token, { signal }));

export const getBrandCampaigns = (token, signal) =>
  apiRequest("/api/Brands/GetCampaigns", withToken(token, { signal }));

export const getBrandCampaign = (token, campaignId, signal) =>
  apiRequest(`/api/Brands/GetCampaign/${campaignId}`, withToken(token, { signal }));

export const createCampaign = (token, data, signal) =>
  apiRequest("/api/Brands/CreateCampaign", withToken(token, {
    method: "POST",
    body: data,
    signal,
  }));

export const updateCampaign = (token, campaignId, data, signal) =>
  apiRequest(`/api/Brands/UpdateCampaign/${campaignId}`, withToken(token, {
    method: "PUT",
    body: data,
    signal,
  }));

export const deleteCampaign = (token, campaignId, signal) =>
  apiRequest(`/api/Brands/DeleteCampaign/${campaignId}`, withToken(token, {
    method: "DELETE",
    signal,
  }));
