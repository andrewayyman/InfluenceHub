import { apiRequest, buildQueryString } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const getCampaignPayment = (token, campaignId, signal) =>
  apiRequest(`/api/Payments/GetCampaignPayment/${campaignId}`, withToken(token, { signal }));

export const getMyPayments = (token, signal) =>
  apiRequest("/api/Payments/GetMyPayments", withToken(token, { signal }));

export const getAllPayments = (token, params, signal) =>
  apiRequest(`/api/Payments/GetAllPayments${buildQueryString(params)}`, withToken(token, { signal }));

export const getPaymentSummary = (token, signal) =>
  apiRequest("/api/Payments/GetPaymentSummary", withToken(token, { signal }));
