//const BASE = '/api';
const BASE = import.meta.env.VITE_API_URL;
const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}` };
  if (!isFormData) h['Content-Type'] = 'application/json';
  return h;
};

const req = async (method, path, body, isFormData = false) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(isFormData),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const text = await res.text(); // read raw response first

  let data;
  try {
    data = JSON.parse(text); // try JSON parse
  } catch (err) {
    console.error("❌ Non-JSON response from server:", text);
    throw new Error("Server error or invalid response");
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  get: (path) => req('GET', path),
  post: (path, body, isFormData) => req('POST', path, body, isFormData),
  put: (path, body) => req('PUT', path, body),
  patch: (path, body) => req('PATCH', path, body),
  delete: (path) => req('DELETE', path)
};
