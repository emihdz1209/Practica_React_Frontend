/**
 * Drop-in replacement for apiClient.js when REACT_APP_MOCK=true.
 * Implements the same .get / .post / .put / .delete interface as an Axios instance
 * but routes everything through the in-memory mockHandlers.
 */
import { mockHandlers } from './mockData';

const dispatch = (method, url, body) => {
  // Strip leading slash and split path
  const parts = url.replace(/^\//, '').split('/'); // e.g. ['tareas', '5']

  const key = `${method} /${parts[0]}`;
  const keyWithId = `${method} /${parts[0]}/:id`;
  const id = parts[1];

  // Special case: GET /tareas/proyecto/:id
  if (method === 'GET' && parts[0] === 'tareas' && parts[1] === 'proyecto' && parts[2]) {
    return mockHandlers['GET /tareas/proyecto/:id'](parts[2]);
  }

  if (id) {
    const handler = mockHandlers[keyWithId];
    if (!handler) return Promise.reject(new Error(`No mock for ${method} ${url}`));
    return handler(id, body);
  }

  const handler = mockHandlers[key];
  if (!handler) return Promise.reject(new Error(`No mock for ${method} ${url}`));
  return handler(body);
};

const mockApiClient = {
  get: (url) => dispatch('GET', url),
  post: (url, body) => dispatch('POST', url, body),
  put: (url, body) => dispatch('PUT', url, body),
  delete: (url) => dispatch('DELETE', url),
};

export default mockApiClient;
