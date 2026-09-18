const API_STORAGE_KEY = 'uraba_api_base_url';
const JWT_STORAGE_KEY = 'jwt_token';
const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const DEFAULT_TIMEOUT_MS = 30000;

function normalizeApiBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_BASE_URL.replace(/\/+$/, '');
  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return /\/api\/v1$/i.test(withoutTrailingSlash)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api/v1`;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    ));
  } catch {
    return null;
  }
}

class ApiClient {
  getBaseUrl() {
    const saved = localStorage.getItem(API_STORAGE_KEY);
    return normalizeApiBaseUrl(saved || DEFAULT_BASE_URL);
  }

  setBaseUrl(value) {
    const normalized = normalizeApiBaseUrl(value);
    localStorage.setItem(API_STORAGE_KEY, normalized);
    return normalized;
  }

  resetBaseUrl() {
    localStorage.removeItem(API_STORAGE_KEY);
    return normalizeApiBaseUrl(DEFAULT_BASE_URL);
  }

  getToken() {
    return localStorage.getItem(JWT_STORAGE_KEY);
  }

  setToken(token) {
    if (token) localStorage.setItem(JWT_STORAGE_KEY, token);
    else localStorage.removeItem(JWT_STORAGE_KEY);
  }

  clearToken() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    // Limpia residuos de versiones anteriores. El frontend actual usa JWT exclusivamente.
    localStorage.removeItem('basic_auth_token');
  }

  hasValidToken() {
    const token = this.getToken();
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now() + 5000;
  }

  getAuthHeader() {
    const jwt = this.getToken();
    return jwt ? `Bearer ${jwt}` : null;
  }

  persistJwtFromResponse(response) {
    const auth = response.headers.get('Authorization');
    const exposed = response.headers.get('X-Auth-Token');
    const token = exposed || (auth?.startsWith('Bearer ') ? auth.slice(7) : null);
    if (token) this.setToken(token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const {
      skipAuth = false,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      signal: externalSignal,
      ...fetchOptions
    } = options;

    const headers = new Headers(fetchOptions.headers || {});
    if (!(fetchOptions.body instanceof FormData) && fetchOptions.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'gestion-beneficiarios');

    if (!skipAuth) {
      if (!this.hasValidToken()) {
        this.clearToken();
        window.dispatchEvent(new CustomEvent('uraba:auth-expired'));
        throw new Error('La sesión expiró. Inicia sesión nuevamente.');
      }
      headers.set('Authorization', this.getAuthHeader());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortExternal = () => controller.abort();
    externalSignal?.addEventListener('abort', abortExternal, { once: true });

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
      this.persistJwtFromResponse(response);

      const contentType = response.headers.get('content-type') || '';
      let payload = null;
      if (response.status !== 204) {
        if (contentType.includes('application/json')) {
          try { payload = await response.json(); } catch { payload = null; }
        } else {
          try { payload = await response.text(); } catch { payload = null; }
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.dispatchEvent(new CustomEvent('uraba:auth-expired'));
        }
        const serverMessage = payload?.mensaje || payload?.message || payload?.error;
        if (serverMessage) throw new Error(serverMessage);
        if (response.status === 401) throw new Error('La sesión expiró o el token JWT no es válido.');
        if (response.status === 403) throw new Error('No tienes permisos para realizar esta acción.');
        if (response.status === 413) throw new Error('El archivo supera el tamaño máximo permitido.');
        throw new Error(`No fue posible completar la solicitud (HTTP ${response.status}).`);
      }

      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado. Verifica la conexión con el servidor.');
      }
      console.error(`Error en API (${endpoint}) [${this.getBaseUrl()}]:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortExternal);
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: options.headers || {}
    });
  }

  postForm(endpoint, formData, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: formData });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiFetch = new ApiClient();
