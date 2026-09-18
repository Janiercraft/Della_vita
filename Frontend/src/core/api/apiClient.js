const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getAuthHeader() {
    // Intentar recuperar las credenciales (base64) desde el almacenamiento
    const token = localStorage.getItem('basic_auth_token');
    if (token) {
      return `Basic ${token}`;
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'gestion-beneficiarios');
    
    const authHeader = this.getAuthHeader();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Manejo básico de errores HTTP
        if (response.status === 401) {
          // Si el token es inválido, podríamos limpiar el localStorage
          // localStorage.removeItem('basic_auth_token');
          throw new Error('Credenciales inválidas o sesión expirada (401)');
        }
        if (response.status === 403) {
          throw new Error('No tienes permisos para esta acción (403)');
        }
        
        let errorMsg = `Error HTTP ${response.status}`;
        try {
            const errData = await response.json();
            if (errData.mensaje) errorMsg = errData.mensaje;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error en API (${endpoint}):`, error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiFetch = new ApiClient();
