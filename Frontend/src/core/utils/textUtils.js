/**
 * Utilidades para tratamiento de texto y búsqueda insensible a tildes/acentos
 */

/**
 * Normaliza una cadena eliminando tildes, diacríticos y convirtiendo a minúsculas
 * Ejemplo: "Andrés" -> "andres", "María" -> "maria", "Necoclí" -> "necocli"
 * @param {string} str 
 * @returns {string}
 */
export function normalizeText(str = '') {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Comprueba si el texto objetivo contiene el término de búsqueda, ignorando tildes y mayúsculas
 * @param {string} target 
 * @param {string} term 
 * @returns {boolean}
 */
export function textMatches(target = '', term = '') {
  const normTarget = normalizeText(target);
  const normTerm = normalizeText(term);
  if (!normTerm) return true;
  return normTarget.includes(normTerm);
}
