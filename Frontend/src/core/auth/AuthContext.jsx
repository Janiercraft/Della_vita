import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';
import { beneficiaryRepository } from '../../modules/beneficiaries/services/beneficiaryRepository';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uraba_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('uraba_auth_authenticated') === 'true';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('uraba_auth_user', JSON.stringify(currentUser));
      localStorage.setItem('uraba_auth_authenticated', 'true');
    } else {
      localStorage.removeItem('uraba_auth_user');
      localStorage.setItem('uraba_auth_authenticated', 'false');
    }
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      // 1. Guardar las credenciales temporales
      const base64Credentials = btoa(`${email}:${password}`);
      localStorage.setItem('basic_auth_token', base64Credentials);

      // 2. Intentar obtener el perfil del servidor
      const response = await apiFetch.get('/auth/me');

      if (response && response.datos) {
        const userData = response.datos;
        const mappedRole = userData.rol.toLowerCase();
        
        const mappedUser = {
          id: String(userData.id),
          role: mappedRole === 'operador' ? 'coordinador' : mappedRole, // Mapeo temporal operador -> coordinador para compatibilidad de vistas
          name: userData.nombreCompleto,
          email: userData.nombreUsuario,
          beneficiaryId: userData.idBeneficiario ? String(userData.idBeneficiario) : null,
          territory: userData.municipioAsignado || 'Urabá',
          avatarInitials: userData.nombreCompleto.substring(0, 2).toUpperCase(),
          badgeColor: mappedRole === 'admin' ? '#094D46' : mappedRole === 'operador' ? '#0D5C53' : '#1CA89D'
        };

        // Extra info si es beneficiario (por ahora lo consultamos del repositorio local, en futuros modulos será del back)
        if (mappedRole === 'consulta' || mappedRole === 'usuario') {
            mappedUser.role = 'usuario';
            if (mappedUser.beneficiaryId) {
                const benRecord = beneficiaryRepository.getById(mappedUser.beneficiaryId);
                if (benRecord) {
                    mappedUser.internalCode = benRecord.internalCode;
                    mappedUser.territory = benRecord.municipality;
                }
            }
        }

        setCurrentUser(mappedUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Respuesta inválida del servidor' };
    } catch (error) {
      localStorage.removeItem('basic_auth_token');
      return { success: false, message: error.message || 'Credenciales inválidas' };
    }
  };

  const logout = () => {
    localStorage.removeItem('basic_auth_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const role = currentUser?.role || 'invitado';
  const canApproveConflicts = role === 'admin' || role === 'coordinador';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        canApproveConflicts,
        login,
        logout
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
