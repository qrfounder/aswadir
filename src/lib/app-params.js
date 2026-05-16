/**
 * Lightweight URL / localStorage param reader.
 *
 * Used to be base44-specific. Now it's a generic helper for stashing
 * query params into localStorage so they survive page reloads.
 */

const isNode = typeof window === "undefined";

function safeSetItem(key, value) {
  if (isNode) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode / denied */
  }
}

function safeGetItem(key) {
  if (isNode) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveItem(key) {
  if (isNode) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const toSnakeCase = (str) => str.replace(/([A-Z])/g, "_$1").toLowerCase();

const getAppParamValue = (
  paramName,
  { defaultValue = undefined, removeFromUrl = false } = {},
) => {
  if (isNode) return defaultValue;

  const storageKey = `massar_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);

  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  if (searchParam) {
    safeSetItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    safeSetItem(storageKey, defaultValue);
    return defaultValue;
  }
  return safeGetItem(storageKey);
};

const getAppParams = () => {
  if (getAppParamValue("clear_access_token") === "true") {
    safeRemoveItem("massar_access_token");
    safeRemoveItem("token");
  }
  return {
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", {
      defaultValue: typeof window !== "undefined" ? window.location.href : undefined,
    }),
  };
};

export const appParams = {
  ...getAppParams(),
};
