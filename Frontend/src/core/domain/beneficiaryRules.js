import { normalizeText } from '../utils/textUtils';

/**
 * Genera el código interno único del beneficiario.
 * Regla: No reemplaza el documento de identidad.
 * Formato: UP-2026-XXXX
 */
export function generateInternalCode(sequence = 1) {
  const year = 2026;
  const paddedNumber = String(sequence).padStart(4, '0');
  return `UP-${year}-${paddedNumber}`;
}

/**
 * Evalúa si un registro es un duplicado o posible coincidencia.
 * 
 * Reglas del Reto URABÁ-PAÍS:
 * 1. Estricta: Coincidencia de Tipo y Número de Documento (cuando aplique documento).
 * 2. Preventiva (sin documento): Si el documento es 'SD' o vacío, advierte si coinciden
 *    nombres similares + fecha de nacimiento o teléfono.
 * 
 * @param {Object} candidate - Datos de la persona que se intenta registrar
 * @param {Array} existingList - Lista de beneficiarios actuales en el sistema
 * @param {string|null} currentId - ID a ignorar si se está editando
 * @returns {Object} { isDuplicate: boolean, isStrict: boolean, matchedBeneficiary: Object|null, message: string }
 */
export function checkDuplicateBeneficiary(candidate, existingList = [], currentId = null) {
  if (!candidate) {
    return { isDuplicate: false, isStrict: false, matchedBeneficiary: null, message: '' };
  }

  const normalizedDocNumber = (candidate.documentNumber || '').trim();
  const docType = candidate.documentType;

  // 1. Regla obligatoria: Coincidencia de tipo y número de documento
  if (docType && docType !== 'SD' && normalizedDocNumber !== '') {
    const strictMatch = existingList.find(b => {
      if (currentId && b.id === currentId) return false;
      return (
        b.documentType === docType &&
        (b.documentNumber || '').trim().toLowerCase() === normalizedDocNumber.toLowerCase()
      );
    });

    if (strictMatch) {
      return {
        isDuplicate: true,
        isStrict: true,
        matchedBeneficiary: strictMatch,
        message: `Ya existe un beneficiario registrado con ${docType} N° ${normalizedDocNumber} (${strictMatch.fullName} - Código: ${strictMatch.internalCode}).`
      };
    }
  }

  // 2. Regla preventiva cuando no hay documento: Nombre + Fecha de nacimiento o Teléfono (insensible a tildes)
  const candidateName = normalizeText(candidate.fullName || '');
  const candidateBirthDate = candidate.birthDate;
  const candidatePhone = (candidate.phone || '').trim();

  if (candidateName) {
    const softMatch = existingList.find(b => {
      if (currentId && b.id === currentId) return false;
      const existingName = normalizeText(b.fullName || '');
      const sameName = existingName === candidateName || (
        candidateName.length > 5 && existingName.includes(candidateName)
      );

      const sameBirth = candidateBirthDate && b.birthDate === candidateBirthDate;
      const samePhone = candidatePhone && (b.phone || '').trim() === candidatePhone;

      return sameName && (sameBirth || samePhone);
    });

    if (softMatch) {
      return {
        isDuplicate: true,
        isStrict: false, // Advertencia heurística que permite confirmación
        matchedBeneficiary: softMatch,
        message: `Posible coincidencia encontrada: ${softMatch.fullName} (Código: ${softMatch.internalCode}) comparte nombres y fecha de nacimiento/teléfono.`
      };
    }
  }

  return {
    isDuplicate: false,
    isStrict: false,
    matchedBeneficiary: null,
    message: ''
  };
}

/**
 * Valida que los datos obligatorios del beneficiario cumplan las reglas del proyecto
 */
export function validateBeneficiaryForm(data) {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.fullName = 'El nombre completo es obligatorio (mínimo 3 caracteres).';
  }

  if (!data.documentType) {
    errors.documentType = 'Seleccione el tipo de documento.';
  }

  if (data.documentType && data.documentType !== 'SD' && (!data.documentNumber || !data.documentNumber.trim())) {
    errors.documentNumber = 'El número de documento es obligatorio para este tipo.';
  }

  if (!data.municipality) {
    errors.municipality = 'El municipio del territorio Urabá es obligatorio.';
  }

  if (!data.dataProcessingConsent) {
    errors.dataProcessingConsent = 'Es obligatorio registrar la autorización para el tratamiento de datos (Habeas Data).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
