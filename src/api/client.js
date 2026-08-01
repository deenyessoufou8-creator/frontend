import axios from 'axios';

// L'URL de l'API est injectée via une variable d'environnement Vite (.env -> VITE_API_URL)
// pour pouvoir pointer facilement vers localhost en dev et vers l'API hébergée en prod.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

// Injecte automatiquement le token JWT stocké après connexion sur chaque requête.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si le token est invalide/expiré, on déconnecte proprement l'utilisateur.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cr_token');
      localStorage.removeItem('cr_user');
    }
    return Promise.reject(error);
  }
);

export default api;
