import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Inscription() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('createur');
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', mot_de_passe: '', nom_entreprise: '', prenom: '', pays: '', adresse: '' });
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  function update(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      await inscription({ role, ...form });
      navigate(role === 'marque' ? '/tableau-de-bord-marque' : '/marketplace');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de créer le compte.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
        <span className="dot" />Fanka
      </div>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Créer un compte</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>Marque ou créateur, choisis ton profil.</p>

      <div className="row2" style={{ marginBottom: 8 }}>
        <button
          type="button"
          className="btn btn-block"
          style={{ background: role === 'createur' ? 'var(--gold)' : 'var(--surface)', color: role === 'createur' ? '#1a1200' : 'var(--cream)', border: '1px solid var(--line)' }}
          onClick={() => setRole('createur')}
        >
          Je suis créateur
        </button>
        <button
          type="button"
          className="btn btn-block"
          style={{ background: role === 'marque' ? 'var(--gold)' : 'var(--surface)', color: role === 'marque' ? '#1a1200' : 'var(--cream)', border: '1px solid var(--line)' }}
          onClick={() => setRole('marque')}
        >
          Je suis une marque
        </button>
      </div>

      {erreur && <div className="error-banner">{erreur}</div>}

      <form onSubmit={onSubmit}>
        <label>Nom complet</label>
        <input value={form.nom} onChange={(e) => update('nom', e.target.value)} required />

        {role === 'marque' && (
          <>
            <label>Nom de l'entreprise</label>
            <input value={form.nom_entreprise} onChange={(e) => update('nom_entreprise', e.target.value)} required />
          </>
        )}

        {role === 'createur' && (
          <>
            <label>Prénom (optionnel, tu peux le compléter plus tard)</label>
            <input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} />

            <label>Pays (optionnel)</label>
            <input value={form.pays} onChange={(e) => update('pays', e.target.value)} placeholder="Bénin" />

            <label>Adresse (optionnel)</label>
            <input value={form.adresse} onChange={(e) => update('adresse', e.target.value)} placeholder="Ville, quartier..." />
          </>
        )}

        <label>Téléphone</label>
        <input type="tel" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} placeholder="+229 xx xx xx xx" required />

        <label>Email (optionnel)</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />

        <label>Mot de passe</label>
        <input type="password" value={form.mot_de_passe} onChange={(e) => update('mot_de_passe', e.target.value)} required minLength={8} />

        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={chargement}>
          {chargement ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="center-link">
        Déjà un compte ? <Link to="/connexion" style={{ color: 'var(--gold)' }}>Se connecter</Link>
      </div>
    </div>
  );
}