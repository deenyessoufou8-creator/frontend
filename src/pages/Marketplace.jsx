import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

export default function Marketplace() {
  const { utilisateur } = useAuth();
  const [campagnes, setCampagnes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [campagneOuverte, setCampagneOuverte] = useState(null);
  const [categorieActive, setCategorieActive] = useState('Toutes');
  const [tri, setTri] = useState('recent');

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/campagnes');
      setCampagnes(data);
    } catch (err) {
      setErreur('Impossible de charger les campagnes.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, []);

  const categories = ['Toutes', ...Array.from(new Set(campagnes.map((c) => c.categorie).filter(Boolean)))];

  let campagnesAffichees = categorieActive === 'Toutes'
    ? campagnes
    : campagnes.filter((c) => c.categorie === categorieActive);

  campagnesAffichees = [...campagnesAffichees].sort((a, b) => {
    if (tri === 'cpm_desc') return Number(b.cpm) - Number(a.cpm);
    if (tri === 'cpm_asc') return Number(a.cpm) - Number(b.cpm);
    if (tri === 'budget_desc') return Number(b.budget_restant) - Number(a.budget_restant);
    return 0;
  });

  return (
    <div>
      <h1 className="page-title">Campagnes actives</h1>
      <p className="subtitle">Rejoins une campagne, publie, gagne au CPM.</p>

      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}

      {!chargement && campagnes.length > 0 && (
        <>
          <div className="chips">
            {categories.map((cat) => (
              <div key={cat} className={`chip ${categorieActive === cat ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setCategorieActive(cat)}>
                {cat}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <select value={tri} onChange={(e) => setTri(e.target.value)} style={{ width: 'auto', fontSize: 12.5, padding: '8px 10px' }}>
              <option value="recent">Plus récentes</option>
              <option value="cpm_desc">CPM le plus élevé</option>
              <option value="cpm_asc">CPM le plus bas</option>
              <option value="budget_desc">Budget restant le plus élevé</option>
            </select>
          </div>
        </>
      )}

      {!chargement && campagnes.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>Aucune campagne active pour le moment.</p>
      )}
      {!chargement && campagnes.length > 0 && campagnesAffichees.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>Aucune campagne dans cette catégorie.</p>
      )}

      <div className="grid">
        {campagnesAffichees.map((c) => {
          const pourcentage = Math.round((c.budget_restant / c.budget_total) * 100);
          return (
            <div className="card" key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{c.nom_entreprise}</div>
                {c.categorie && <span className="tag">{c.categorie}</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5 }}>{c.titre}</div>

              <div className="cpm-ticket">
                <span className="label">CPM</span>
                <span className="value">{fmt(c.cpm)} FCFA / 1000 vues</span>
              </div>

              <div className="progress-row">
                <span>Budget restant</span>
                <span>{fmt(c.budget_restant)} / {fmt(c.budget_total)} FCFA</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pourcentage}%` }} /></div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {c.plateformes.map((p) => (
                  <span key={p} style={{ fontSize: 10.5, color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 8px' }}>{p}</span>
                ))}
              </div>

              {utilisateur.role === 'createur' && (
                campagneOuverte === c.id
                  ? <FormulaireSoumission campagne={c} onTermine={() => { setCampagneOuverte(null); charger(); }} onAnnuler={() => setCampagneOuverte(null)} />
                  : <button className="btn btn-primary btn-block" onClick={() => setCampagneOuverte(c.id)}>Rejoindre la campagne</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormulaireSoumission({ campagne, onTermine, onAnnuler }) {
  const [plateforme, setPlateforme] = useState(campagne.plateformes[0]);
  const [lien, setLien] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.post(`/campagnes/${campagne.id}/soumissions`, { plateforme, lien_contenu: lien });
      onTermine();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la soumission.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre}>
      {erreur && <div className="error-banner">{erreur}</div>}
      <label>Plateforme</label>
      <select value={plateforme} onChange={(e) => setPlateforme(e.target.value)}>
        {campagne.plateformes.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <label>Lien de ta vidéo publiée</label>
      <input type="url" value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://..." required />
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onAnnuler}>Annuler</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={envoi}>{envoi ? 'Envoi...' : 'Soumettre'}</button>
      </div>
    </form>
  );
}