import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatsBadge from '../components/StatsBadge';

export default function Connexion() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const utilisateur = await connexion(telephone, motDePasse);
      if (utilisateur.role === 'marque') navigate('/tableau-de-bord-marque');
      else if (utilisateur.role === 'createur') navigate('/marketplace');
      else navigate('/admin');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de se connecter. Vérifie tes identifiants.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
        <span className="dot" />Fanka
      </div>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Connexion</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>Accède à ton espace marque ou créateur.</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><StatsBadge /></div>

      {erreur && <div className="error-banner">{erreur}</div>}

      <form onSubmit={onSubmit}>
        <label>Téléphone</label>
        <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229 xx xx xx xx" required />

        <label>Mot de passe</label>
        <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />

        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={chargement}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="center-link">
        Pas encore de compte ? <Link to="/inscription" style={{ color: 'var(--gold)' }}>Créer un compte</Link>
      </div>
    </div>
  );
}
