import { apiAdapter } from '../../../core/adapters/apiAdapter';

class EventRepository {
  async list(programId = null, onlyActive = true) {
    return apiAdapter.getEventos(programId, onlyActive);
  }
  async create(data) {
    return apiAdapter.createEvento(data);
  }
  async update(id, data) {
    return apiAdapter.updateEvento(id, data);
  }
  async applyToProgram(programId) {
    return apiAdapter.postularmePrograma(programId);
  }
  async applyToEvent(eventId) {
    return apiAdapter.postularmeEvento(eventId);
  }
  async cancelMyEvent(eventId) {
    return apiAdapter.cancelarMiInscripcionEvento(eventId);
  }
  async myEvents() {
    return apiAdapter.getMisEventos();
  }
  async myParticipations() {
    return apiAdapter.getMisParticipaciones();
  }
}

export const eventRepository = new EventRepository();
