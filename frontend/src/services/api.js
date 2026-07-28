const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_PROXY_TARGET ||
  '/api';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Falha de comunicação com o backend.');
  }

  return data;
}

export const api = {
  login(profile) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },
  bootstrap() {
    return request('/api/bootstrap');
  },
  getRemainingOrders() {
    return request('/api/orders/remaining');
  },
  updateRemainingOrders(remainingOrders, actorId) {
    return request('/api/orders/remaining', {
      method: 'PATCH',
      body: JSON.stringify({ remainingOrders, actorId }),
    });
  },
  updatePresence(profile) {
    return request('/api/presence', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },
  createNote(note) {
    return request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },
  updateNote(id, updates) {
    return request(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  deleteNote(id, actorId) {
    return request(`/api/notes/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ actorId }),
    });
  },
  createCategory(category) {
    return request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  updateCategory(key, updates) {
    return request(`/api/categories/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  deleteCategory(key, actorId) {
    return request(`/api/categories/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      body: JSON.stringify({ actorId }),
    });
  },
  listUsers() {
    return request('/api/users');
  },
  createUser(user) {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  updateUser(id, updates) {
    return request(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  deleteUser(id, actorId) {
    return request(`/api/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ actorId }),
    });
  },
  sendChatMessage(message) {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },
  createActivity(activity) {
    return request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },
};
