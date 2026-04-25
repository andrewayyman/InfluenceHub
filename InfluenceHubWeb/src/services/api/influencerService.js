import { apiRequest, buildQueryString } from "./client";

export const influencerService = {
  getProfile: (token) =>
    apiRequest("/api/Influencers/GetProfile", { method: "GET", token }),

  updateProfile: (profileData, token) =>
    apiRequest("/api/Influencers/UpdateProfile", {
      method: "PUT",
      body: profileData,
      token,
    }),

  getSuggestedCampaigns: (filters = {}, token) => {
    const query = buildQueryString(filters);
    return apiRequest(`/api/Campaigns/GetOpenCampaigns${query}`, { method: "GET", token });
  },

  getCampaignDetails: (campaignId, token) =>
    apiRequest(`/api/Campaigns/GetById/${campaignId}`, { method: "GET", token }),

  applyForCampaign: (applicationData, token) =>
    apiRequest("/api/Applications/Apply", {
      method: "POST",
      body: applicationData,
      token,
    }),

  getMyApplications: (token) =>
    apiRequest("/api/Influencers/GetMyApplications", { method: "GET", token }),

  submitReport: async (formData, token) => {
    const response = await fetch("/api/Reports/SubmitReport", {
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
           if (err && err.message) errorMsg = err.message;
       } catch {}
       throw new Error(errorMsg);
    }
    return response.json();
  },

  getMyReports: (token) =>
    apiRequest("/api/Reports/GetMyReports", { method: "GET", token }),
};
