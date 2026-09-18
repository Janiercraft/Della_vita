import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';

const AuthContext = createContext(null);

const mapBackendUser = (userData) => {
  const rol = String(userData?.rol || '')
    .toUpperCase()
    .replace(/^ROLE_/, '')
    .trim();

  // Acepta tanto los nombres técnicos del backend como aliases de interfaz.
  // Esto evita que un ADMIN/COORDINADOR pierda opciones del menú por una
  // diferencia de nomenclatura entre ambientes.
  const mappedRole = ['ADMIN', 'ADMINISTRADOR'].includes(rol) ? 'admin'
    : ['COORDINADOR', 'COORDINATOR'].includes(rol) ? 'coordinador'
    : ['OPERADOR', 'PROFESIONAL', 'FUNCIONARIO'].includes(rol) ? 'profesional'
    : ['CONSULTA', 'BENEFICIARIO', 'USUARIO'].includes(rol) ? 'usuario'
    : 'invitado';

  return {
    id: String(userData.id),
    version: userData.version || 0,
    role: mappedRole,
    backendRole: rol,
    name: userData.nombreCompleto,
    username: userData.nombreUsuario,
    email: userData.correo || '',
    beneficiaryId: userData.idBeneficiario ? String(userData.idBeneficiario) : null,
    territory: userData.municipioAsignado || 'Urabá',
    avatarInitials: (userData.nombreCompleto || 'US').substring(0, 2).toUpperCase(),
    badgeColor: mappedRole === 'admin' ? '#094D46' : mappedRole === 'profesional' ? '#0D5C53' : '#1CA89D'
  };
};

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
    return localStorage.getItem('uraba_auth_authenticated') === 'true' && apiFetch.hasValidToken();
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

  useEffect(() => {
    const clearSession = () => {
      apiFetch.clearToken();
      setCurrentUser(null);
      setIsAuthenticated(false);
    };

    const validateSession = async () => {
      if (!apiFetch.hasValidToken()) {
        clearSession();
        return;
      }
      try {
        const response = await apiFetch.get('/auth/me');
        if (!response?.datos) {
          clearSession();
          return;
        }
        const freshUser = mapBackendUser(response.datos);
        setCurrentUser((previous) => ({ ...previous, ...freshUser }));
        setIsAuthenticated(true);
      } catch {
        clearSession();
      }
    };

    window.addEventListener('uraba:auth-expired', clearSession);
    if (currentUser || localStorage.getItem('uraba_auth_authenticated') === 'true') {
      validateSession();
    }
    return () => window.removeEventListener('uraba:auth-expired', clearSession);
    // La validacion se ejecuta una vez al montar el proveedor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identifier, password) => {
    apiFetch.clearToken();
    try {
      const response = await apiFetch.post('/auth/login', {
        identificador: identifier.trim(),
        clave: password
      }, { skipAuth: true });

      if (!response?.datos) {
        return { success: false, message: 'El servidor no devolvió un perfil válido.' };
      }

      const mappedUser = mapBackendUser(response.datos);
      if (mappedUser.role === 'invitado') {
        return { success: false, message: 'Tu cuenta no tiene un rol válido. Contacta al coordinador.' };
      }

      if (!apiFetch.hasValidToken()) {
        return { success: false, message: 'El servidor autenticó al usuario pero no entregó un token JWT válido.' };
      }

      // El backend ya valida durante /auth/login que una cuenta CONSULTA esté
      // vinculada a un beneficiario existente y activo. Para completar el perfil
      // consultamos un endpoint propio del usuario, no /beneficiarios/{id}, porque
      // ese endpoint administrativo está restringido a ADMIN y OPERADOR.
      if (mappedUser.role === 'usuario') {
        if (!mappedUser.beneficiaryId) {
          apiFetch.clearToken();
          return {
            success: false,
            message: 'Tu cuenta no está vinculada a un beneficiario registrado en la plataforma. Contacta al coordinador.'
          };
        }

        try {
          const ownBeneficiaryResponse = await apiFetch.get('/auth/mi-beneficiario');
          const benRecord = ownBeneficiaryResponse?.datos;
          if (!benRecord || benRecord.activo === false) {
            apiFetch.clearToken();
            return {
              success: false,
              message: 'El beneficiario asociado no está disponible para acceso. Contacta al coordinador.'
            };
          }
          mappedUser.internalCode = benRecord.codigoInterno || '';
          mappedUser.territory = benRecord.municipio || mappedUser.territory;
        } catch (error) {
          apiFetch.clearToken();
          return {
            success: false,
            message: error.message || 'No fue posible validar tu registro como beneficiario.'
          };
        }
      }

      setCurrentUser(mappedUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      apiFetch.clearToken();
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: false, message: error.message || 'No fue posible iniciar sesión.' };
    }
  };

  const logout = () => {
    apiFetch.clearToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const role = currentUser?.role || 'invitado';
  const canApproveConflicts = role === 'admin' || role === 'coordinador';

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, role, canApproveConflicts, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
