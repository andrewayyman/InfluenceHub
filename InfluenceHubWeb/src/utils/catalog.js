export const PLATFORM_OPTIONS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "LinkedIn",
  "Twitter",
  "Snapchat",
  "Pinterest",
  "Twitch",
];

export const BUDGET_TYPE_OPTIONS = [
  { value: 0, label: "Campaign Total", description: "Fixed total for the whole brief" },
  { value: 1, label: "Per Story", description: "Paid per story (24h content)" },
  { value: 2, label: "Per Post", description: "Paid per feed post or tweet" },
  { value: 3, label: "Per Reel", description: "Paid per reel / short video" },
];

export const getBudgetTypeLabel = (budgetType) => {
  const hit = BUDGET_TYPE_OPTIONS.find((x) => x.value === Number(budgetType));
  return hit?.label ?? "Campaign Total";
};

export const EGYPT_CITIES = [
  "Nationwide (Egypt)",
  "Cairo",
  "Giza",
  "Alexandria",
  "Luxor",
  "Aswan",
  "Hurghada",
  "Sharm El-Sheikh",
  "Ismailia",
  "Port Said",
  "Suez",
  "Tanta",
  "Mansoura",
  "Zagazig",
  "Damietta",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Beni Suef",
  "Fayoum",
  "Damanhur",
  "Kafr El-Sheikh",
  "Shibin El-Kom",
  "Banha",
  "Marsa Matruh",
  "Al-Arish",
  "South Sinai",
  "Red Sea (Governorate)",
  "New Valley (Kharga)",
  "Global / Remote",
];
