import React, { createContext, useContext, useState, useEffect } from 'react';
import { beneficiaryRepository } from '../../modules/beneficiaries/services/beneficiaryRepository';

const AuthContext = createContext(null);

export const DEFAULT_ACCOUNTS = {
  admin: {
    id: 'usr-admin-01',
    role: 'admin',
    name: 'Dra. Carmen Valencia',
    title: 'Coordinadora General del Consorcio',
    organization: 'COOPI • FADV • HIAS • HI',
    email: 'admin@uraba.org',
    password: 'admin',
    avatarInitials: 'CV',
    badgeColor: '#094D46',
    territory: 'Territorio Urabá (Apartadó, Turbo, Necoclí)'
  },
  coordinador: {
    id: 'usr-coord-01',
    role: 'coordinador',
    name: 'Ing. Roberto Montoya',
    title: 'Coordinador Territorial de Proyectos',
    organization: 'Consorcio Humanitario Urabá-País',
    email: 'coordinador@uraba.org',
    password: 'coordinador',
    avatarInitials: 'RM',
    badgeColor: '#0D5C53',
    territory: 'Apartadó • Turbo • Necoclí'
  },
  profesional: {
    id: 'usr-prof-01',
    role: 'profesional',
    name: 'Lic. Andrés Restrepo',
    title: 'Profesional Psicosocial y de Terreno',
    organization: 'Equipo Técnico de Atención Humanitaria',
    email: 'profesional@uraba.org',
    password: 'profesional',
    avatarInitials: 'AR',
    badgeColor: '#1E6F65',
    territory: 'Apartadó y Necoclí'
  },
  usuario: {
    id: 'usr-cit-01',
    role: 'usuario',
    beneficiaryId: 'ben-001',
    name: 'María Elena Rivas Palacios',
    title: 'Beneficiaria Titular',
    organization: 'Comunidad Urabá-País',
    email: 'maria.rivas@uraba.org',
    password: 'usuario',
    avatarInitials: 'MR',
    badgeColor: '#1CA89D',
    internalCode: 'UP-2026-0001',
    territory: 'Apartadó'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uraba_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_ACCOUNTS.admin; // Inicia por defecto logueado como Admin para comodidad, o en LoginView si no está autenticado
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('uraba_auth_authenticated');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('uraba_auth_user', JSON.stringify(currentUser));
      localStorage.setItem('uraba_auth_authenticated', String(isAuthenticated));
    } else {
      localStorage.removeItem('uraba_auth_user');
      localStorage.setItem('uraba_auth_authenticated', 'false');
    }
  }, [currentUser, isAuthenticated]);

  const login = (role, email, password, customBeneficiaryId = null) => {
    // 1. Administrador
    if (role === 'admin') {
      const adminAccount = DEFAULT_ACCOUNTS.admin;
      if (password !== adminAccount.password && password !== 'admin123') {
        return { success: false, message: 'Contraseña incorrecta para el rol de Administrador.' };
      }
      setCurrentUser(adminAccount);
      setIsAuthenticated(true);
      return { success: true };
    }

    // 2. Coordinador
    if (role === 'coordinador') {
      const coordAccount = DEFAULT_ACCOUNTS.coordinador;
      if (password !== coordAccount.password && password !== 'coordinador123') {
        return { success: false, message: 'Contraseña incorrecta para el rol de Coordinador.' };
      }
      setCurrentUser(coordAccount);
      setIsAuthenticated(true);
      return { success: true };
    }

    // 3. Profesional
    if (role === 'profesional') {
      const profAccount = DEFAULT_ACCOUNTS.profesional;
      if (password !== profAccount.password && password !== 'profesional123') {
        return { success: false, message: 'Contraseña incorrecta para el rol de Profesional.' };
      }
      setCurrentUser(profAccount);
      setIsAuthenticated(true);
      return { success: true };
    }

    // 4. Usuario / Beneficiario
    if (role === 'usuario') {
      const userAccount = { ...DEFAULT_ACCOUNTS.usuario };
      if (password !== userAccount.password && password !== 'usuario123' && password !== '123456') {
        return { success: false, message: 'Contraseña incorrecta para el rol de Usuario.' };
      }

      // Si seleccionó un beneficiario específico de la base de datos
      const benId = customBeneficiaryId || userAccount.beneficiaryId;
      const benRecord = beneficiaryRepository.getById(benId);

      if (benRecord) {
        userAccount.beneficiaryId = benRecord.id;
        userAccount.name = benRecord.fullName;
        userAccount.internalCode = benRecord.internalCode;
        userAccount.territory = benRecord.municipality;
        userAccount.avatarInitials = benRecord.fullName.slice(0, 2).toUpperCase();
      }

      setCurrentUser(userAccount);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, message: 'Rol no reconocido.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Conmutador directo de rol para demostraciones rápidas ante el jurado
  const switchRole = (targetRole, targetBeneficiaryId = null) => {
    if (DEFAULT_ACCOUNTS[targetRole]) {
      if (targetRole === 'usuario') {
        const userAccount = { ...DEFAULT_ACCOUNTS.usuario };
        const benId = targetBeneficiaryId || 'ben-001';
        const benRecord = beneficiaryRepository.getById(benId);
        if (benRecord) {
          userAccount.beneficiaryId = benRecord.id;
          userAccount.name = benRecord.fullName;
          userAccount.internalCode = benRecord.internalCode;
          userAccount.territory = benRecord.municipality;
          userAccount.avatarInitials = benRecord.fullName.slice(0, 2).toUpperCase();
        }
        setCurrentUser(userAccount);
      } else {
        setCurrentUser(DEFAULT_ACCOUNTS[targetRole]);
      }
      setIsAuthenticated(true);
    }
  };

  const role = currentUser?.role || 'admin';
  // Solo Coordinadora (admin/coordinador) puede autorizar coincidencias de nombre duplicado
  const canApproveConflicts = role === 'admin' || role === 'coordinador';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        canApproveConflicts,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
