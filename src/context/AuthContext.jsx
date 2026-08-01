import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stored = localStorage.getItem('cr_user');
    return stored ? JSON.parse(stored) : null;
  });

  const connexion = useCallback(async (telephone, mot_de_passe) => {
    const { data } = await api.post('/auth/connexion', { telephone, mot_de_passe });
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    return data.utilisateur;
  }, []);

  const inscription = useCallback(async (payload) => {
    const { data } = await api.post('/auth/inscription', payload);
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    return data.utilisateur;
  }, []);

  const deconnexion = useCallback(() => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    setUtilisateur(null);
  }, []);

  return (
    <AuthContext.Provider value={{ utilisateur, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>.');
  return ctx;
}
