import { beneficiaryRepository } from '../../beneficiaries/services/beneficiaryRepository.js';
import { programRepository } from '../../programs/services/programRepository.js';
import { attentionRepository } from '../../attentions/services/attentionRepository.js';
import { calculateAggregatedMetrics } from '../../../core/domain/reportRules.js';

class ReportRepository {
  getAggregatedReports() {
    const beneficiaries = beneficiaryRepository.getAll() || [];
    const enrollments = typeof programRepository.getAllEnrollments === 'function'
      ? programRepository.getAllEnrollments()
      : (typeof programRepository.getAll === 'function' ? programRepository.getAll() : []);
    const attentions = attentionRepository.getAttentions() || [];
    const followups = attentionRepository.getFollowUps() || [];

    return calculateAggregatedMetrics(beneficiaries, enrollments, attentions, followups);
  }

  getConsolidatedProfile360(beneficiaryId) {
    if (!beneficiaryId) return null;

    const beneficiary = beneficiaryRepository.getById(beneficiaryId);
    if (!beneficiary) return null;

    const linkedPrograms = programRepository.getByBeneficiaryId(beneficiaryId);
    const attentions = attentionRepository.getAttentions().filter(a => a.beneficiaryId === beneficiaryId);
    const followups = attentionRepository.getFollowUps().filter(f => f.beneficiaryId === beneficiaryId);
    const allTimelineEvents = attentionRepository.getByBeneficiaryId(beneficiaryId);

    return {
      beneficiary,
      familyMembers: beneficiary.familyMembers || [],
      linkedPrograms,
      attentions,
      followups,
      allTimelineEvents
    };
  }

  resetAllDemoData() {
    beneficiaryRepository.resetData();
    programRepository.resetData();
    attentionRepository.resetData();
    return true;
  }
}

export const reportRepository = new ReportRepository();
