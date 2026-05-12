import { apiRequest } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const createReview = (token, data, signal) =>
  apiRequest("/api/Reviews/Create", withToken(token, {
    method: "POST",
    body: data,
    signal,
  }));

export const createInfluencerReview = (token, data, signal) =>
  apiRequest("/api/Reviews/CreateInfluencerReview", withToken(token, {
    method: "POST",
    body: data,
    signal,
  }));

export const getInfluencerReviews = (influencerId, signal) =>
  apiRequest(`/api/Reviews/GetInfluencerReviews/${influencerId}`, { method: "GET", signal });

export const getInfluencerReviewSummary = (influencerId, signal) =>
  apiRequest(`/api/Reviews/GetInfluencerReviewSummary/${influencerId}`, { method: "GET", signal });

export const getBrandReviews = (brandId, signal) =>
  apiRequest(`/api/Reviews/GetBrandReviews/${brandId}`, { method: "GET", signal });
