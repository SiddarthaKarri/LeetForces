// Always use public CORS proxy as requested by user
// The public proxy is needed because Codeforces API doesn't support CORS
// Using corsproxy.io as it is often more reliable than allorigins
export const API_BASE_URL = 'https://corsproxy.io/?https://codeforces.com/api';

// Dynamic base URL derived from Vite's import.meta.env.BASE_URL
// This will be '/LeetForces/' in production and '/' in development
// We remove the trailing slash for consistency in URL construction
export const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL;
