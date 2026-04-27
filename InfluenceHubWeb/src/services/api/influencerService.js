import { apiRequest, buildQueryString, resolveApiUrl } from "./client";

export const influencerService = {
  getProfile: (token, signal) =>
    apiRequest("/api/Influencers/GetProfile", { method: "GET", token, signal }),

  updateProfile: (profileData, token, signal) =>
    apiRequest("/api/Influencers/UpdateProfile", {
      method: "PUT",
      body: profileData,
      token,
      signal,
    }),

  getOpenCampaigns: (filters = {}, token, signal) => {
    const query = buildQueryString(filters);
    return apiRequest(`/api/Campaigns/GetOpenCampaigns${query}`, { method: "GET", token, signal });
  },

  getSuggestedCampaigns: (filters = {}, token, signal) => {
    const query = buildQueryString(filters);
    return apiRequest(`/api/Matching/GetSuggestedCampaigns${query}`, { method: "GET", token, signal });
  },

  getCampaignDetails: (campaignId, token, signal) =>
    apiRequest(`/api/Campaigns/GetById/${campaignId}`, { method: "GET", token, signal }),

  applyForCampaign: (applicationData, token, signal) =>
    apiRequest("/api/Applications/Apply", {
      method: "POST",
      body: applicationData,
      token,
      signal,
    }),

  getMyApplications: (token, signal) =>
    apiRequest("/api/Influencers/GetMyApplications", { method: "GET", token, signal }),

  submitReport: async (formData, token) => {
    const response = await fetch(resolveApiUrl("/api/Reports/SubmitReport"), {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
        // no Content-Type required for multipart/form-data
      }
    });

    if (!response.ok) {
       let errorMsg = "Failed to submit report.";
       try {
           const err = await response.json();
           if (err && err.message) {
               errorMsg = err.message;
           } else if (err && err.errors) {
               // Handle ASP.NET Core validation errors
               const firstError = Object.values(err.errors).flat()[0];
               if (firstError) errorMsg = firstError;
           } else if (err && err.title) {
               errorMsg = err.title;
           }
       } catch {}
       throw new Error(errorMsg);
    }
    return response.json();
  },

  getMyReports: (token, signal) =>
    apiRequest("/api/Reports/GetMyReports", { method: "GET", token, signal }),
};
