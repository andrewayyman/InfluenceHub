const JSON_CONTENT_TYPE = "application/json";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const isAbortError = (error) =>
  error?.name === "AbortError" || error?.code === "ERR_CANCELED";

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return "";
  }

  return configuredBaseUrl.replace(/\/$/, "");
};

export const resolveApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

const extractErrorMessage = (payload, fallbackMessage) => {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  if (typeof payload.title === "string") {
    return payload.title;
  }

  if (payload.errors && typeof payload.errors === "object") {
    const firstError = Object.values(payload.errors).flat().find(Boolean);

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return fallbackMessage;
};

const parseResponseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes(JSON_CONTENT_TYPE)) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const apiRequest = async (path, options = {}) => {
  const { body, headers = {}, method = "GET", signal, token } = options;
  const requestHeaders = { ...headers };

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = JSON_CONTENT_TYPE;
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    signal,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, "The request could not be completed."),
      response.status,
      payload,
    );
  }

  return payload;
};
