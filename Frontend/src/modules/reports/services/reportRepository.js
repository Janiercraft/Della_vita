import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository.js';
import { programRepository } from '../../programs/services/programRepository.js';
import { attentionRepository } from '../../attentions/services/attentionRepository.js';
import { apiAdapter } from '../../../core/adapters/apiAdapter';
import { calculateAggregatedMetrics } from '../../../core/domain/reportRules.js';

class ReportRepository {
  async getAggregatedReports() {
    const [beneficiaries, enrollments] = await Promise.all([
      beneficiaryRepository.getAll(),
      programRepository.load()
    ]);
    await attentionRepository.load();
    const attentions = attentionRepository.getAttentions();
    const followups = attentionRepository.getFollowUps();

    const local = calculateAggregatedMetrics(beneficiaries, enrollments, attentions, followups);
    try {
      const backend = await apiAdapter.getResumenReportes();
      return { ...local, backendResumen: backend };
    } catch {
      return local;
    }
  }

  async getConsolidatedProfile360(beneficiaryId) {
    if (!beneficiaryId) return null;
    const beneficiary = await beneficiaryRepository.getById(beneficiaryId);
    if (!beneficiary) return null;

    try {
      const historial = await apiAdapter.getFicha360(beneficiary.rawId || beneficiaryId);
      return {
        beneficiary,
        familyMembers: beneficiary.familyMembers || [],
        linkedPrograms: programRepository.getByBeneficiaryId(beneficiaryId),
        attentions: attentionRepository.getAttentions().filter((a) => String(a.beneficiaryId) === String(beneficiaryId)),
        followups: attentionRepository.getFollowUps().filter((f) => String(f.beneficiaryId) === String(beneficiaryId)),
        allTimelineEvents: attentionRepository.getByBeneficiaryId(beneficiaryId),
        historial
      };
    } catch {
      return {
        beneficiary,
        familyMembers: beneficiary.familyMembers || [],
        linkedPrograms: programRepository.getByBeneficiaryId(beneficiaryId),
        attentions: attentionRepository.getAttentions().filter((a) => String(a.beneficiaryId) === String(beneficiaryId)),
        followups: attentionRepository.getFollowUps().filter((f) => String(f.beneficiaryId) === String(beneficiaryId)),
        allTimelineEvents: attentionRepository.getByBeneficiaryId(beneficiaryId)
      };
    }
  }

  async resetAllDemoData() {
    await Promise.all([
      programRepository.load(),
      attentionRepository.load()
    ]);
    return true;
  }
}

export const reportRepository = new ReportRepository();
