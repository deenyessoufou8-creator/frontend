import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import PAYS_AFRIQUE from '../data/paysAfrique';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function MonProfil() {
  const { utilisateur } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ prenom: '', pays: '', adresse: '' });
  const [infoLecture, setInfoLecture] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const statutTiktok = searchParams.get('tiktok'); // 'connecte' | 'refuse' | 'erreur' | null

  useEffect(() => {
    if (utilisateur.role !== 'createur') return;
    (async () => {
      try {
        const { data } = await api.get('/createurs/mon-profil');
        setInfoLecture(data);
        setForm({ prenom: data.prenom || '', pays: data.pays || 'Bénin', adresse: data.adresse || '' });
      } catch (err) {
        setErreur('Impossible de charger ton profil.');
      } finally {
        setChargement(false);
      }
    })();
  }, [utilisateur.role]);

  if (utilisateur.role === 'marque') return <Navigate to="/tableau-de-bord-marque" replace />;
  if (utilisateur.role === 'admin') return <Navigate to="/admin" replace />;

  function update(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
    setSucces(false);
  }

  async function enregistrer(e) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.patch('/createurs/mon-profil', form);
      setSucces(true);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la mise à jour.');
    } finally {
      setEnvoi(false);
    }
  }

  function connecterTiktok() {
    const token = localStorage.getItem('cr_token');
    window.location.href = `${API_URL}/auth/tiktok/connexion?token=${encodeURIComponent(token)}`;
  }

  if (chargement) return <p style={{ color: 'var(--muted)' }}>Chargement...</p>;

  return (
    <div>
      <h1 className="page-title">Mon profil</h1>
      <p className="subtitle">Ces informations ne sont visibles que par toi et par l'équipe Fanka (admin) — jamais par les marques.</p>

      {erreur && <div className="error-banner">{erreur}</div>}
      {succes && <div className="success-banner">Profil mis à jour ✓</div>}
      {statutTiktok === 'connecte' && <div className="success-banner">Compte TikTok connecté avec succès ✓</div>}
      {statutTiktok === 'refuse' && <div className="error-banner">Connexion TikTok annulée.</div>}
      {statutTiktok === 'erreur' && <div className="error-banner">Erreur lors de la connexion TikTok. Réessaie.</div>}

      {infoLecture && (
        <div className="card" style={{ maxWidth: 480, marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>Nom complet</div>
          <div style={{ marginBottom: 12 }}>{infoLecture.nom}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>Téléphone</div>
          <div style={{ marginBottom: 12 }}>{infoLecture.telephone}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>Email</div>
          <div>{infoLecture.email || '—'}</div>
        </div>
      )}

      <div className="card" style={{ maxWidth: 480, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Comptes connectés</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
          Connecte tes comptes pour que Fanka puisse compter automatiquement tes vues, sans que tu aies à envoyer de capture d'écran.
        </p>
        <button type="button" className="btn btn-ghost" onClick={connecterTiktok}>
          🔗 Connecter mon compte TikTok
        </button>
      </div>

      <form onSubmit={enregistrer} style={{ maxWidth: 480 }}>
        <label>Prénom</label>
        <input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} placeholder="Ton prénom" />

        <label>Pays</label>
        <select value={form.pays} onChange={(e) => update('pays', e.target.value)}>
          {PAYS_AFRIQUE.map((p) => (
            <option key={p.nom} value={p.nom}>{p.nom}</option>
          ))}
        </select>

        <label>Adresse</label>
        <input value={form.adresse} onChange={(e) => update('adresse', e.target.value)} placeholder="Ville, quartier..." />

        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={envoi}>
          {envoi ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}