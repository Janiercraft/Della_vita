/**
 * Adaptador de Almacenamiento Local (Liskov Substitution Principle & Dependency Inversion)
 * Permite cambiar la persistencia a una API Backend PHP/REST sin tocar la lógica de la UI.
 */

class StorageAdapter {
  constructor(storageKey = 'URABA_PAIS_DATA_STORE_V1') {
    this.storageKey = storageKey;
    this.memoryFallback = new Map();
  }

  isAvailable() {
    try {
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get(collectionName) {
    if (this.isAvailable()) {
      try {
        const raw = window.localStorage.getItem(`${this.storageKey}_${collectionName}`);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn(`Error al leer colección ${collectionName} de localStorage:`, err);
      }
    }
    return this.memoryFallback.get(collectionName) || null;
  }

  set(collectionName, data) {
    if (this.isAvailable()) {
      try {
        window.localStorage.setItem(`${this.storageKey}_${collectionName}`, JSON.stringify(data));
      } catch (err) {
        console.warn(`Error al guardar en localStorage para ${collectionName}:`, err);
      }
    }
    this.memoryFallback.set(collectionName, data);
  }

  clear() {
    if (this.isAvailable()) {
      try {
        Object.keys(window.localStorage)
          .filter(k => k.startsWith(this.storageKey))
          .forEach(k => window.localStorage.removeItem(k));
      } catch (err) {
        console.warn('Error al limpiar localStorage:', err);
      }
    }
    this.memoryFallback.clear();
  }
}

export const storageAdapter = new StorageAdapter();
