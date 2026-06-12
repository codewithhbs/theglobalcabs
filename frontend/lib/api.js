// Lightweight API client. Works in both server and client components.
const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server.globalcabs.adsdigitalmedia.com';
export const API_BASE = BASE;

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gc_token');
};

export async function api(path, { method = 'GET', body, isForm = false, cache = 'no-store', revalidate } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const opts = {
    method,
    headers,
    credentials: 'include',
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  };
  if (revalidate !== undefined) opts.next = { revalidate };
  else opts.cache = cache;

  const res = await fetch(`${BASE}/api/v1${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Server-side fetch helpers with ISR caching for public content
export const getSettings = () => api('/settings', { revalidate: 300 }).then((r) => r.data).catch(() => null);
export const getPopularRoutes = () => api('/routes?isPopular=true&status=active&limit=8', { revalidate: 120 }).then((r) => r.data).catch(() => []);
export const getRoutes = (qs = '') => api(`/routes?status=active&limit=100${qs}`, { revalidate: 120 }).then((r) => r.data).catch(() => []);
export const getVehicles = () => api('/vehicles?status=active&limit=50', { revalidate: 300 }).then((r) => r.data).catch(() => []);
export const getTestimonials = () => api('/testimonials?status=active&limit=12', { revalidate: 600 }).then((r) => r.data).catch(() => []);
export const getPage = (slug) => api(`/cms/pages/${slug}`, { revalidate: 600 }).then((r) => r.data).catch(() => null);
export const getBlogs = (qs = '') => api(`/blogs?status=published&limit=24${qs}`, { revalidate: 300 }).then((r) => r.data).catch(() => []);
export const getBlog = (slug) => api(`/blogs/${slug}`).then((r) => r.data).catch(() => null);
export const getRouteDetail = (slug) => api(`/routes/detail/${slug}`, { revalidate: 120 }).then((r) => r.data).catch(() => null);
export const getVehicle = (slug) => api(`/vehicles/${slug}`, { revalidate: 300 }).then((r) => r.data).catch(() => null);
export const resolveSeo = (path) => api(`/seo/resolve?path=${encodeURIComponent(path)}`, { revalidate: 600 }).then((r) => r.data).catch(() => null);
