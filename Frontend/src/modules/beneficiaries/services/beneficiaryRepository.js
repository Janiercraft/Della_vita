import { storageAdapter } from '../../../core/adapters/storageAdapter';
import { apiAdapter } from '../../../core/adapters/apiAdapter';
import { INITIAL_BENEFICIARIES } from '../../../core/data/initialData';
import { generateInternalCode, checkDuplicateBeneficiary } from '../../../core/domain/beneficiaryRules';
import { textMatches } from '../../../core/utils/textUtils';

const COLLECTION_KEY = 'beneficiaries';

class BeneficiaryRepository {
  constructor() {
    this.init();
  }

  async init() {
    try {
      const backendBens = await apiAdapter.getBeneficiarios();
      if (backendBens && backendBens.length > 0) {
        storageAdapter.set(COLLECTION_KEY, backendBens);
        return;
      }
    } catch (err) {
      console.warn('Backend sync warning:', err.message);
    }

    const existing = storageAdapter.get(COLLECTION_KEY);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      storageAdapter.set(COLLECTION_KEY, INITIAL_BENEFICIARIES);
    }
  }

  async syncWithBackend() {
    try {
      const backendBens = await apiAdapter.getBeneficiarios();
      if (backendBens && backendBens.length > 0) {
        storageAdapter.set(COLLECTION_KEY, backendBens);
        return backendBens;
      }
    } catch (err) {
      console.warn('Backend sync failed:', err.message);
    }
    return this.getAll();
  }

  getAll() {
    return storageAdapter.get(COLLECTION_KEY) || [];
  }

  getByMunicipality(municipality) {
    const list = this.getAll();
    return list.filter(b => (b.municipality || '').toLowerCase() === (municipality || '').toLowerCase());
  }

  getById(id) {
    const list = this.getAll();
    return list.find(b => String(b.id) === String(id) || String(b.rawId) === String(id)) || null;
  }

  getByCode(code) {
    const list = this.getAll();
    return list.find(b => (b.internalCode || '').toLowerCase() === (code || '').toLowerCase().trim()) || null;
  }

  search(query = '', municipality = '', documentType = '') {
    const list = this.getAll();
    const q = query.trim();

    return list.filter(item => {
      const matchMun = !municipality || item.municipality === municipality;
      if (!matchMun) return false;

      const matchDocType = !documentType || item.documentType === documentType;
      if (!matchDocType) return false;

      if (!q) return true;

      const matchName = textMatches(item.fullName, q);
      const matchDoc = textMatches(item.documentNumber, q);
      const matchCode = textMatches(item.internalCode, q);
      const matchPhone = textMatches(item.phone, q);

      const matchFamily = (item.familyMembers || []).some(m => textMatches(m.fullName, q));

      return matchName || matchDoc || matchCode || matchPhone || matchFamily;
    });
  }

  create(beneficiaryData) {
    const list = this.getAll();

    const duplicateCheck = checkDuplicateBeneficiary(beneficiaryData, list);
    if (duplicateCheck.isDuplicate && duplicateCheck.isStrict) {
      throw new Error(duplicateCheck.message);
    }

    const sequence = list.length + 1;
    const newBeneficiary = {
      ...beneficiaryData,
      id: `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      internalCode: beneficiaryData.internalCode || generateInternalCode(sequence),
      familyMembers: beneficiaryData.familyMembers || [],
      registeredAt: new Date().toISOString(),
      consentDate: beneficiaryData.consentDate || new Date().toISOString().split('T')[0]
    };

    const updated = [newBeneficiary, ...list];
    storageAdapter.set(COLLECTION_KEY, updated);

    // Intentar sincronizar asíncronamente con el Backend en segundo plano
    apiAdapter.createBeneficiario(beneficiaryData)
      .then(createdFromApi => {
        if (createdFromApi) {
          const currentList = this.getAll();
          const idx = currentList.findIndex(b => b.id === newBeneficiary.id);
          if (idx !== -1) {
            currentList[idx] = createdFromApi;
            storageAdapter.set(COLLECTION_KEY, currentList);
          }
        }
      })
      .catch(err => console.warn('Error guardando en backend:', err.message));

    return newBeneficiary;
  }

  update(id, updatedData) {
    const list = this.getAll();
    const index = list.findIndex(b => String(b.id) === String(id) || String(b.rawId) === String(id));
    if (index === -1) {
      throw new Error(`Beneficiario con ID ${id} no encontrado.`);
    }

    const duplicateCheck = checkDuplicateBeneficiary(updatedData, list, id);
    if (duplicateCheck.isDuplicate && duplicateCheck.isStrict) {
      throw new Error(duplicateCheck.message);
    }

    const updatedBeneficiary = {
      ...list[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    list[index] = updatedBeneficiary;
    storageAdapter.set(COLLECTION_KEY, list);

    const targetId = list[index].rawId || id;
    if (targetId && !isNaN(targetId)) {
      apiAdapter.updateBeneficiario(targetId, updatedBeneficiary)
        .catch(err => console.warn('Error actualizando en backend:', err.message));
    }

    return updatedBeneficiary;
  }

  addFamilyMember(beneficiaryId, memberData) {
    const beneficiary = this.getById(beneficiaryId);
    if (!beneficiary) throw new Error('Beneficiario no encontrado.');

    const newMember = {
      ...memberData,
      id: `fam-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    const updatedFamily = [...(beneficiary.familyMembers || []), newMember];
    return this.update(beneficiaryId, { familyMembers: updatedFamily });
  }

  removeFamilyMember(beneficiaryId, memberId) {
    const beneficiary = this.getById(beneficiaryId);
    if (!beneficiary) throw new Error('Beneficiario no encontrado.');

    const updatedFamily = (beneficiary.familyMembers || []).filter(m => m.id !== memberId);
    return this.update(beneficiaryId, { familyMembers: updatedFamily });
  }

  resetData() {
    storageAdapter.set(COLLECTION_KEY, INITIAL_BENEFICIARIES);
    return INITIAL_BENEFICIARIES;
  }
}

export const beneficiaryRepository = new BeneficiaryRepository();

