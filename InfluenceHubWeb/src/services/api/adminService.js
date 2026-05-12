import { apiRequest, buildQueryString } from "./client";

const withToken = (token, overrides = {}) => ({
  token,
  ...overrides,
});

export const getDashboard = (token, signal) => apiRequest("/api/admin/getdashboard", withToken(token, { signal }));

export const getUsers = (token, params, signal) => apiRequest(
  `/api/admin/getusers${buildQueryString(params)}`,
  withToken(token, { signal }),
);

export const enableUser = (token, userId) => apiRequest(
  `/api/admin/enableuser/${userId}`,
  withToken(token, { method: "PATCH" }),
);

export const disableUser = (token, userId) => apiRequest(
  `/api/admin/disableuser/${userId}`,
  withToken(token, { method: "PATCH" }),
);

export const deleteUser = (token, userId) => apiRequest(
  `/api/admin/deleteuser/${userId}`,
  withToken(token, { method: "DELETE" }),
);

export const getCampaigns = (token, params, signal) => apiRequest(
  `/api/admin/getcampaigns${buildQueryString(params)}`,
  withToken(token, { signal }),
);

export const closeCampaign = (token, campaignId) => apiRequest(
  `/api/admin/closecampaign/${campaignId}`,
  withToken(token, { method: "PATCH" }),
);

export const deleteCampaign = (token, campaignId) => apiRequest(
  `/api/admin/deletecampaign/${campaignId}`,
  withToken(token, { method: "DELETE" }),
);

export const getReports = (token, params, signal) => apiRequest(
  `/api/admin/getreports${buildQueryString(params)}`,
  withToken(token, { signal }),
);

export const approveReport = (token, reportId) => apiRequest(
  `/api/admin/approvereport/${reportId}`,
  withToken(token, { method: "PATCH" }),
);

export const rejectReport = (token, reportId, rejectionReason) => apiRequest(
  `/api/admin/rejectreport/${reportId}`,
  withToken(token, {
    method: "PATCH",
    body: rejectionReason ? { rejectionReason } : {},
  }),
);

export const getContactMessages = (token, params, signal) => apiRequest(
  `/api/admin/getcontactmessages${buildQueryString(params)}`,
  withToken(token, { signal }),
);

export const markContactReplied = (token, messageId) => apiRequest(
  `/api/admin/markcontactreplied/${messageId}`,
  withToken(token, { method: "PATCH" }),
);

export const getCommission = (token, signal) => apiRequest(
  `/api/admin/getcommission`,
  withToken(token, { signal }),
);

export const setCommission = (token, data) => apiRequest(
  `/api/admin/setcommission`,
  withToken(token, { method: "PUT", body: data }),
);

export const getCommissionHistory = (token, signal) => apiRequest(
  `/api/admin/getcommissionhistory`,
  withToken(token, { signal }),
);

export const getPayments = (token, params, signal) => apiRequest(
  `/api/admin/getpayments${buildQueryString(params)}`,
  withToken(token, { signal }),
);

export const getPaymentSummary = (token, signal) => apiRequest(
  `/api/admin/getpaymentsummary`,
  withToken(token, { signal }),
);
