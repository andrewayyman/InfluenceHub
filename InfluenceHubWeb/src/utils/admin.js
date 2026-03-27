export const CAMPAIGN_STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Open", value: "Open" },
  { label: "Influencer selected", value: "InfluencerSelected" },
  { label: "Report submitted", value: "ReportSubmitted" },
  { label: "Completed", value: "Completed" },
  { label: "Closed", value: "Closed" },
];

export const REPORT_STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export const USER_ROLE_OPTIONS = [
  { label: "All roles", value: "" },
  { label: "Brand", value: "Brand" },
  { label: "Influencer", value: "Influencer" },
];

export const USER_STATE_OPTIONS = [
  { label: "All accounts", value: "" },
  { label: "Active", value: "true" },
  { label: "Disabled", value: "false" },
];

export const MESSAGE_STATUS_OPTIONS = [
  { label: "All messages", value: "" },
  { label: "Needs reply", value: "false" },
  { label: "Replied", value: "true" },
];

export const humanizeEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
};

export const getStatusTone = (value) => {
  switch (value) {
    case "Brand":
      return "brand";
    case "Influencer":
      return "emerald";
    case "Approved":
    case "Completed":
    case true:
      return "success";
    case "Rejected":
    case false:
      return "danger";
    case "Open":
      return "brand";
    case "Closed":
      return "neutral";
    default:
      return "warning";
  }
};

export const getActivityLabel = (value) => (value ? "Active" : "Disabled");

export const getMessageLabel = (value) => (value ? "Replied" : "Needs reply");

export const getEngagementTotal = (report) => (report.likes || 0) + (report.comments || 0) + (report.shares || 0);

export const getEngagementRate = (report) => {
  if (!report?.views) {
    return 0;
  }

  return getEngagementTotal(report) / report.views;
};

export const getMessagePreview = (message) => {
  if (!message?.message) {
    return "No message body provided.";
  }

  if (message.message.length <= 148) {
    return message.message;
  }

  return `${message.message.slice(0, 145)}...`;
};
