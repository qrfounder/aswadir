/**
 * Lightweight URL / localStorage param reader.
 *
 * Used to be base44-specific. Now it's a generic helper for stashing
 * query params into localStorage so they survive page reloads.
 */

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) =>
	str.replace(/([A-Z])/g, '_$1').toLowerCase();

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
			urlParams.toString() ? `?${urlParams.toString()}` : ''
		}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}

	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	return storage.getItem(storageKey);
};

const getAppParams = () => {
	if (getAppParamValue('clear_access_token') === 'true') {
		storage.removeItem('massar_access_token');
		storage.removeItem('token');
	}
	return {
		token: getAppParamValue('access_token', { removeFromUrl: true }),
		fromUrl: getAppParamValue('from_url', {
			defaultValue: typeof window !== 'undefined' ? window.location.href : undefined,
		}),
	};
};

export const appParams = {
	...getAppParams(),
};
