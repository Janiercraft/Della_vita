import { apiAdapter } from '../../../core/adapters/apiAdapter';
import { checkDuplicateEnrollment } from '../../../core/domain/programRules';
import { textMatches } from '../../../core/utils/textUtils';

class ProgramRepository {
  constructor() {
    this._enrollments = [];
    this._programs = [];
  }

  getProgramsCatalog() {
    return this._programs;
  }

  async loadForBeneficiary() {
    const [programas, parts] = await Promise.all([
      apiAdapter.getProgramas(),
      apiAdapter.getMisParticipaciones()
    ]);
    this._programs = programas.map((p) => ({
      id: p.id, code: p.code, name: p.name, lineId: p.lineId, lineName: p.lineName,
      leadOrg: p.leadOrg, targetEstimated: p.targetEstimated, description: p.description,
      createdAt: p.createdAt, updatedAt: p.updatedAt, active: p.active
    }));
    const progMap = Object.fromEntries(this._programs.map((p) => [String(p.id), p]));
    this._enrollments = parts.map((part) => {
      const prog = progMap[String(part.idPrograma)] || {};
      return apiAdapter.fromParticipacionDto(part, {
        programName: prog.name, programCode: prog.code, lineId: prog.lineId, lineName: prog.lineName
      });
    });
    return this._enrollments;
  }

  async applyAsBeneficiary(programId) {
    const result = await apiAdapter.postularmePrograma(programId);
    await this.loadForBeneficiary();
    return result;
  }

  async load() {
    const [programas, parts, bens] = await Promise.all([
      apiAdapter.getProgramas(),
      apiAdapter.getParticipaciones(),
      apiAdapter.getBeneficiarios()
    ]);

    this._programs = programas.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      lineId: p.lineId,
      lineName: p.lineName,
      leadOrg: p.leadOrg,
      targetEstimated: p.targetEstimated,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      active: p.active
    }));

    const progMap = Object.fromEntries(this._programs.map((p) => [String(p.id), p]));
    const benMap = Object.fromEntries(bens.map((b) => [String(b.rawId || b.id), b]));

    this._enrollments = parts.map((part) => {
      const prog = progMap[String(part.idPrograma)] || {};
      const ben = benMap[String(part.idBeneficiario)] || {};
      return apiAdapter.fromParticipacionDto(part, {
        programName: prog.name,
        programCode: prog.code,
        lineId: prog.lineId,
        lineName: prog.lineName,
        beneficiaryName: ben.fullName,
        beneficiaryCode: ben.internalCode,
        beneficiaryDoc: ben.documentNumber,
        municipality: ben.municipality
      });
    });

    return this._enrollments;
  }

  getAllEnrollments() {
    return this._enrollments;
  }

  getAll() {
    return this.getAllEnrollments();
  }

  getById(id) {
    return this._enrollments.find((e) => String(e.id) === String(id)) || null;
  }

  getByBeneficiaryId(beneficiaryId) {
    return this._enrollments.filter((e) => String(e.beneficiaryId) === String(beneficiaryId));
  }

  getByProgramId(programId) {
    return this._enrollments.filter((e) => String(e.programId) === String(programId));
  }

  searchEnrollments(query = '', lineId = '', status = '', municipality = '') {
    const q = query.trim();
    return this._enrollments.filter((item) => {
      if (lineId && item.lineId !== lineId) return false;
      if (status && item.status !== status) return false;
      if (municipality && item.beneficiaryMunicipality !== municipality) return false;
      if (!q) return true;
      return textMatches(item.beneficiaryName, q)
        || textMatches(item.beneficiaryCode, q)
        || textMatches(item.programName, q)
        || textMatches(item.beneficiaryDoc, q);
    });
  }

  async createEnrollment(enrollmentData) {
    const dupCheck = checkDuplicateEnrollment(
      enrollmentData.beneficiaryId,
      enrollmentData.programId,
      this._enrollments
    );
    if (dupCheck.isEnrolled) throw new Error(dupCheck.message);

    const created = await apiAdapter.createParticipacion(enrollmentData);
    const program = this.getProgramsCatalog().find((p) => String(p.id) === String(enrollmentData.programId));
    const mapped = apiAdapter.fromParticipacionDto(created, {
      programName: program?.name || enrollmentData.programName,
      programCode: program?.code,
      lineId: program?.lineId,
      lineName: program?.lineName,
      beneficiaryName: enrollmentData.beneficiaryName,
      beneficiaryCode: enrollmentData.beneficiaryCode,
      beneficiaryDoc: enrollmentData.beneficiaryDoc,
      municipality: enrollmentData.beneficiaryMunicipality
    });
    this._enrollments = [mapped, ...this._enrollments];
    return mapped;
  }

  async updateEnrollmentStatus(id, newStatus, additionalNotes = '') {
    const current = this.getById(id);
    if (!current) throw new Error(`Vinculación con ID ${id} no encontrada.`);
    const dto = {
      id: Number(current.rawId || current.id),
      version: current.version || 0,
      idBeneficiario: Number(current.beneficiaryId),
      idPrograma: Number(current.programId),
      periodo: current.periodo || new Date().getFullYear().toString(),
      fechaIngreso: current.enrollmentDate,
      estadoParticipacion: String(newStatus || 'INSCRITO').toUpperCase(),
      observaciones: additionalNotes
        ? `${current.notes ? `${current.notes} | ` : ''}${additionalNotes}`
        : current.notes
    };
    const updatedDto = await apiAdapter.updateParticipacion(current.rawId || current.id, dto);
    const updated = {
      ...current,
      status: (updatedDto.estadoParticipacion || newStatus).toLowerCase(),
      notes: updatedDto.observaciones || dto.observaciones,
      version: updatedDto.version
    };
    this._enrollments = this._enrollments.map((e) => (String(e.id) === String(id) ? updated : e));
    return updated;
  }

  async deleteEnrollment(id) {
    const current = this.getById(id);
    if (!current) return true;
    await apiAdapter.changeParticipacionEstado(current.rawId || current.id, false, 'Eliminado desde UI', current.version || 0);
    this._enrollments = this._enrollments.filter((e) => String(e.id) !== String(id));
    return true;
  }

  async resetData() {
    return this.load();
  }
}

export const programRepository = new ProgramRepository();
