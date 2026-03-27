export const AUTH_STORAGE_KEY = "influencehub.auth";

const ROLE_MAP = {
  0: "brand",
  1: "influencer",
  2: "admin",
  admin: "admin",
  brand: "brand",
  influencer: "influencer",
  Admin: "admin",
  Brand: "brand",
  Influencer: "influencer",
};

export const normalizeRole = (value) => ROLE_MAP[value] ?? null;

export const getRoleLabel = (value) => {
  const role = normalizeRole(value);

  if (!role) {
    return "User";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleDashboardPath = (value) => {
  const role = normalizeRole(value);

  switch (role) {
    case "admin":
      return "/dashboard/admin";
    default:
      return "/";
  }
};

export const getUserInitials = (user) => {
  const source = user?.displayName || user?.name || user?.email || "IH";
  const trimmed = source.trim();

  if (!trimmed) {
    return "IH";
  }

  if (trimmed.includes("@")) {
    return trimmed.charAt(0).toUpperCase();
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "IH";
};

export const buildSession = (payload) => {
  const role = normalizeRole(payload?.role);

  if (!payload?.token || !payload?.email || !role) {
    return null;
  }

  return {
    token: payload.token,
    user: {
      id: payload.userId,
      email: payload.email,
      role,
      displayName: getRoleLabel(role) === "Admin" ? "Admin" : payload.email,
    },
  };
};

export const readStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);

    if (!parsed?.token || !parsed?.user?.email || !normalizeRole(parsed?.user?.role)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      token: parsed.token,
      user: {
        ...parsed.user,
        role: normalizeRole(parsed.user.role),
      },
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const writeStoredSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
