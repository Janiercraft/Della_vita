import { apiFetch } from '../../../core/api/apiClient';

const unwrap = (res) => res?.datos ?? res;
const unwrapList = (res) => {
  const data = unwrap(res);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

class UserRepository {
  async getAll() {
    const all = [];
    let page = 0;
    let totalPages = 1;
    do {
      const response = await apiFetch.get(`/usuarios?pagina=${page}&tamanio=100`);
      const data = unwrap(response);
      all.push(...unwrapList(response));
      totalPages = Number(data?.totalPages ?? 1);
      page += 1;
    } while (page < totalPages && page < 100);
    return all;
  }

  async create(payload) {
    return unwrap(await apiFetch.post('/usuarios', payload));
  }

  async update(id, payload) {
    return unwrap(await apiFetch.put(`/usuarios/${id}`, payload));
  }

  async changeStatus(id, version, activo) {
    return unwrap(await apiFetch.patch(`/usuarios/${id}/estado`, {
      version,
      activo,
      motivo: activo ? 'Cuenta habilitada por coordinación' : 'Cuenta deshabilitada por coordinación'
    }));
  }
}

export const userRepository = new UserRepository();
