import { apiAdapter } from '../../../core/adapters/apiAdapter';
import { textMatches } from '../../../core/utils/textUtils';

class BeneficiaryRepository {
  async getAll() {
    return await apiAdapter.getBeneficiarios();
  }

  async getById(id) {
    return await apiAdapter.getBeneficiarioById(id);
  }

  async getMyProfile() {
    return await apiAdapter.getMiBeneficiario();
  }

  async search(query = '', municipality = '', documentType = '') {
    // We can do this in-memory if we have the list, but since search takes string we will query the backend
    // Since getBeneficiarios handles pagination, let's just use it directly, or filter an in-memory list for instant UX
    // To preserve the instant UX, we will let the component fetch getAll() and do the filtering in useBeneficiaries.js!
    // But the component currently calls repository.search() with the cached `beneficiaries`.
    // Let's refactor search to take the list as an argument.
    throw new Error("search must be done on the component state for instant UX");
  }

  // Refactored to be a pure function to filter the provided list
  searchInList(list, query = '', municipality = '', documentType = '') {
    const q = query.trim();
    return list.filter(item => {
      const matchMun = !municipality || item.municipality === municipality;
      if (!matchMun) return false;

      const matchDocType = !documentType || item.documentType === documentType;
      if (!matchDocType) return false;

      if (!q) return true;

      const fullName = `${item.firstName || ''} ${item.secondName || ''} ${item.firstLastName || ''} ${item.secondLastName || ''}`.trim();

      const matchName = textMatches(fullName, q);
      const matchDoc = textMatches(item.documentNumber, q);
      const matchCode = textMatches(item.internalCode, q);
      const matchPhone = textMatches(item.phone, q);
      const matchFamily = (item.familyMembers || []).some(m => textMatches(m.fullName, q));

      return matchName || matchDoc || matchCode || matchPhone || matchFamily;
    });
  }

  async create(beneficiaryData) {
    return await apiAdapter.createBeneficiario(beneficiaryData);
  }

  async update(id, updatedData) {
    return await apiAdapter.updateBeneficiario(id, updatedData);
  }

  async changeStatus(id, activo, motivo) {
    return await apiAdapter.changeBeneficiarioStatus(id, activo, motivo);
  }

  async addFamilyMember(beneficiaryId, memberData) {
    return await apiAdapter.addFamiliar(beneficiaryId, memberData);
  }

  async removeFamilyMember(beneficiaryId, memberId) {
    return await apiAdapter.removeFamiliar(beneficiaryId, memberId);
  }

  async resetData() {
    return this.getAll();
  }
}

export const beneficiaryRepository = new BeneficiaryRepository();
