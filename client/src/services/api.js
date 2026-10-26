import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // the JWT lives in an HTTP-only cookie, never in JS-readable storage
  headers: { 'X-Requested-With': 'XMLHttpRequest' }, // custom header forces a CORS preflight; used as CSRF defence
  timeout: 20000,
});

// Turn any failure into a plain Error carrying a user-friendly message and field errors.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error); // aborted requests are not errors to show
    const data = error.response?.data;
    const err = new Error(
      data?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : 'We could not reach the server. Check your connection and try again.'),
    );
    err.status = error.response?.status;
    err.details = data?.details;
    return Promise.reject(err);
  },
);

export const getErrorMessage = (e) => e?.message || 'Something went wrong. Please try again.';

export default api;
