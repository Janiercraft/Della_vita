import { storageAdapter } from '../../../core/adapters/storageAdapter';
import { INITIAL_ENROLLMENTS } from '../../../core/data/initialProgramsData';
import { PROGRAMS_CATALOG, checkDuplicateEnrollment } from '../../../core/domain/programRules';
import { textMatches } from '../../../core/utils/textUtils';

const COLLECTION_KEY = 'program_enrollments';

class ProgramRepository {
  constructor() {
    this.init();
  }

  init() {
    const existing = storageAdapter.get(COLLECTION_KEY);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageAdapter.set(COLLECTION_KEY, INITIAL_ENROLLMENTS);
    }
  }

  getProgramsCatalog() {
    return PROGRAMS_CATALOG;
  }

  getAllEnrollments() {
    return storageAdapter.get(COLLECTION_KEY) || [];
  }

  getAll() {
    return this.getAllEnrollments();
  }

  getById(id) {
    const list = this.getAllEnrollments();
    return list.find(e => e.id === id) || null;
  }

  getByBeneficiaryId(beneficiaryId) {
    const list = this.getAllEnrollments();
    return list.filter(e => e.beneficiaryId === beneficiaryId);
  }

  getByProgramId(programId) {
    const list = this.getAllEnrollments();
    return list.filter(e => e.programId === programId);
  }

  searchEnrollments(query = '', lineId = '', status = '', municipality = '') {
    const list = this.getAllEnrollments();
    const q = query.trim();

    return list.filter(item => {
      const matchLine = !lineId || item.lineId === lineId;
      if (!matchLine) return false;

      const matchStatus = !status || item.status === status;
      if (!matchStatus) return false;

      const matchMun = !municipality || item.beneficiaryMunicipality === municipality;
      if (!matchMun) return false;

      if (!q) return true;

      const matchName = textMatches(item.beneficiaryName, q);
      const matchCode = textMatches(item.beneficiaryCode, q);
      const matchProgram = textMatches(item.programName, q);
      const matchDoc = textMatches(item.beneficiaryDoc, q);

      return matchName || matchCode || matchProgram || matchDoc;
    });
  }

  createEnrollment(enrollmentData) {
    const list = this.getAllEnrollments();

    // Comprobación de no duplicar vinculación activa en el mismo programa
    const dupCheck = checkDuplicateEnrollment(
      enrollmentData.beneficiaryId,
      enrollmentData.programId,
      list
    );

    if (dupCheck.isEnrolled) {
      throw new Error(dupCheck.message);
    }

    const program = PROGRAMS_CATALOG.find(p => p.id === enrollmentData.programId);
    if (!program) {
      throw new Error('El programa seleccionado no es válido.');
    }

    const newEnrollment = {
      id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      beneficiaryId: enrollmentData.beneficiaryId,
      beneficiaryCode: enrollmentData.beneficiaryCode,
      beneficiaryName: enrollmentData.beneficiaryName,
      beneficiaryDoc: enrollmentData.beneficiaryDoc,
      beneficiaryMunicipality: enrollmentData.beneficiaryMunicipality,
      programId: program.id,
      programCode: program.code,
      programName: program.name,
      lineId: program.lineId,
      lineName: program.lineName,
      enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: enrollmentData.status || 'inscrito',
      notes: enrollmentData.notes || '',
      createdAt: new Date().toISOString()
    };

    const updated = [newEnrollment, ...list];
    storageAdapter.set(COLLECTION_KEY, updated);
    return newEnrollment;
  }

  updateEnrollmentStatus(id, newStatus, additionalNotes = '') {
    const list = this.getAllEnrollments();
    const index = list.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Vinculación con ID ${id} no encontrada.`);
    }

    const current = list[index];
    const updated = {
      ...current,
      status: newStatus,
      notes: additionalNotes ? `${current.notes ? current.notes + ' | ' : ''}${additionalNotes}` : current.notes,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    storageAdapter.set(COLLECTION_KEY, list);
    return updated;
  }

  deleteEnrollment(id) {
    const list = this.getAllEnrollments();
    const updated = list.filter(e => e.id !== id);
    storageAdapter.set(COLLECTION_KEY, updated);
    return true;
  }

  resetData() {
    storageAdapter.set(COLLECTION_KEY, INITIAL_ENROLLMENTS);
    return INITIAL_ENROLLMENTS;
  }
}

export const programRepository = new ProgramRepository();
