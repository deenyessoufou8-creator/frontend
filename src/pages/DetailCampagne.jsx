import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

const LABELS_STATUT_CAMPAGNE = {
  brouillon: 'Brouillon',
  fonds_bloques: 'Fonds bloqués',
  active: 'Active',
  suspendue: 'Suspendue',
  terminee: 'Terminée',
};

const LABELS_STATUT_SOUMISSION = {
  en_attente: 'En attente de review',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
  en_comptage: 'En cours (comptage des vues)',
  verrouillee: 'Terminée',
  payee: 'Payée',
};

export default function DetailCampagne() {
  const { id } = useParams();
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const { data } = await api.get(`/campagnes/${id}/dashboard`);
        setDonnees(data);
      } catch (err) {
        setErreur(err.response?.data?.erreur || 'Impossible de charger cette campagne.');
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  if (chargement) return <p style={{ color: 'var(--muted)' }}>Chargement...</p>;
  if (erreur) return <div className="error-banner">{erreur}</div>;
  if (!donnees) return null;

  const { campagne, soumissions, vues_cumulees, budget_depense } = donnees;
  const pourcentage = campagne.budget_total > 0 ? Math.round((campagne.budget_restant / campagne.budget_total) * 100) : 0;
  const coutMoyenPour1000Vues = vues_cumulees > 0 ? (budget_depense / vues_cumulees) * 1000 : 0;

  const vuesCible = campagne.cpm > 0 ? (Number(campagne.budget_total) / Number(campagne.cpm)) * 1000 : 0;
  const vuesRestantes = Math.max(vuesCible - vues_cumulees, 0);
  const pourcentageVues = vuesCible > 0 ? Math.min(Math.round((vues_cumulees / vuesCible) * 100), 100) : 0;
  const estTerminee = campagne.statut === 'terminee';

  return (
    <div>
      <Link to="/mes-campagnes" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>← Retour à mes campagnes</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 }}>
        <div>
          <h1 className="page-title">{campagne.titre}</h1>
          <p className="subtitle">{campagne.categorie || 'Sans catégorie'}</p>
        </div>
        <span className="tag" style={estTerminee ? { background: 'rgba(255,177,0,0.2)' } : {}}>
          {estTerminee ? '✓ Terminée' : (LABELS_STATUT_CAMPAGNE[campagne.statut] || campagne.statut)}
        </span>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="hero-label">OBJECTIF DE VUES {estTerminee ? '— ATTEINT' : ''}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span className="hero-value" style={{ fontSize: 28 }}>{fmt(vues_cumulees)}</span>
          <span style={{ color: 'var(--muted)', fontSize: 15 }}>/ {fmt(vuesCible)} vues estimées</span>
        </div>
        <div className="progress-row"><span>Progression</span><span>{pourcentageVues}%</span></div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pourcentageVues}%` }} /></div>
        <div style={{ fontSize: 12.5, color: estTerminee ? 'var(--gold)' : 'var(--muted)', marginTop: 4 }}>
          {estTerminee
            ? "Objectif atteint — budget entièrement distribué aux créateurs."
            : `Il reste environ ${fmt(vuesRestantes)} vues à générer pour épuiser le budget.`}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Budget total" valeur={`${fmt(campagne.budget_total)} F`} />
        <StatCard label="Budget dépensé" valeur={`${fmt(budget_depense)} F`} accent="gold" />
        <StatCard label="Budget restant" valeur={`${fmt(campagne.budget_restant)} F`} />
        <StatCard label="Nb soumissions" valeur={soumissions.length} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="progress-row"><span>Budget consommé</span><span>{100 - pourcentage}%</span></div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${100 - pourcentage}%` }} /></div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          CPM configuré : <span className="mono" style={{ color: 'var(--cream)' }}>{fmt(campagne.cpm)} FCFA / 1000 vues</span>
          {' · '}Coût moyen réel : <span className="mono" style={{ color: 'var(--cream)' }}>{vues_cumulees > 0 ? fmt(coutMoyenPour1000Vues) : '—'} FCFA / 1000 vues</span>
        </div>
      </div>

      <h1 className="page-title" style={{ fontSize: 17, marginBottom: 14 }}>Soumissions ({soumissions.length})</h1>
      <div className="card">
        {soumissions.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucun créateur n'a encore rejoint cette campagne.</p>}
        {soumissions.length > 0 && (
          <table>
            <thead>
              <tr><th>Créateur</th><th>Plateforme</th><th>Statut</th><th>Vues</th><th>Gains</th></tr>
            </thead>
            <tbody>
              {soumissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.createur_nom}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.plateforme}</td>
                  <td>{LABELS_STATUT_SOUMISSION[s.statut] || s.statut}</td>
                  <td className="mono">{fmt(s.vues_actuelles)}</td>
                  <td className="mono gold">{fmt(s.gains_calcules)} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, valeur, accent }) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 0, textAlign: 'center' }}>
      <div className={`mono ${accent === 'gold' ? 'gold' : ''}`} style={{ fontSize: 20, fontWeight: 600 }}>{valeur}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}