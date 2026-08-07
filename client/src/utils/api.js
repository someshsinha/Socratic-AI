import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For backward compatibility or manual token setting
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

let getTokenFunc = null;

// Registers the Auth0 getAccessTokenSilently method to dynamically resolve tokens
export const registerTokenProvider = (fn) => {
  getTokenFunc = fn;
};

// Request interceptor to automatically inject the Bearer token
api.interceptors.request.use(async (config) => {
  if (getTokenFunc) {
    try {
      const token = await getTokenFunc();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[Axios API] Failed to fetch token silently', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
