/** @typedef {'track' | 'tools' | 'news' | 'account'} DashboardSection */

/** @type {DashboardSection[]} */
export const DASHBOARD_SECTIONS = ["track", "tools", "news", "account"];

/** @param {string} value @returns {value is DashboardSection} */
export function isDashboardSection(value) {
  return DASHBOARD_SECTIONS.includes(value);
}
