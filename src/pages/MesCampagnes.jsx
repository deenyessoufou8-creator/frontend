import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

const LABELS_STATUT = {
  brouillon: 'Brouillon',
  fonds_bloques: 'Fonds bloqués',
  active: 'Active',
  suspendue: 'Suspendue',
  terminee: 'Terminée',
};

export default function MesCampagnes() {
  const [campagnes, setCampagnes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/campagnes/mes-campagnes');
        setCampagnes(data);
      } catch (err) {
        setErreur('Impossible de charger vos campagnes.');
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Mes campagnes</h1>
          <p className="subtitle">Uniquement les campagnes de ton entreprise.</p>
        </div>
        <Link to="/creer-campagne" className="btn btn-primary">+ Nouvelle campagne</Link>
      </div>

      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}

      {!chargement && campagnes.length === 0 && (
        <div className="card">
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Tu n'as encore créé aucune campagne. <Link to="/creer-campagne" style={{ color: 'var(--gold)' }}>Crée la première</Link>.
          </p>
        </div>
      )}

      <div className="grid">
        {campagnes.map((c) => {
          const pourcentage = c.budget_total > 0 ? Math.round((c.budget_restant / c.budget_total) * 100) : 0;
          return (
            <Link to={`/mes-campagnes/${c.id}`} className="card" key={c.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5 }}>{c.titre}</div>
                <span className="tag">{LABELS_STATUT[c.statut] || c.statut}</span>
              </div>

              <div className="cpm-ticket">
                <span className="label">CPM</span>
                <span className="value">{fmt(c.cpm)} FCFA / 1000 vues</span>
              </div>

              <div className="progress-row">
                <span>Budget restant</span>
                <span>{fmt(c.budget_restant)} / {fmt(c.budget_total)} FCFA</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pourcentage}%` }} /></div>

              {c.statut === 'brouillon' && (
                <p style={{ fontSize: 12, color: 'var(--coral)', margin: '8px 0 0' }}>
                  Fonds non déposés — cette campagne n'est pas encore visible des créateurs.
                </p>
              )}
              <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '10px 0 0' }}>Voir les statistiques détaillées →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
