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
  const [modeEdition, setModeEdition] = useState(false);
  const [action, setAction] = useState(null);
  const [createurOuvert, setCreateurOuvert] = useState(null);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get(`/campagnes/${id}/dashboard`);
      setDonnees(data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de charger cette campagne.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, [id]);

  async function basculerSuspension() {
    setAction('suspension');
    try {
      await api.patch(`/campagnes/${id}/suspendre`);
      await charger();
    } catch (err) {
      alert(err.response?.data?.erreur || 'Erreur lors du changement de statut.');
    } finally {
      setAction(null);
    }
  }

  async function deposerFonds() {
    setAction('depot');
    try {
      await api.post(`/campagnes/${id}/deposer-fonds`, {
        methode_paiement: 'mtn_momo',
        reference_externe: `DEMO-${Date.now()}`,
      });
      await charger();
    } catch (err) {
      alert(err.response?.data?.erreur || 'Erreur lors du dépôt de fonds.');
    } finally {
      setAction(null);
    }
  }

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
  const estBrouillon = campagne.statut === 'brouillon';
  const estActiveOuSuspendue = ['active', 'suspendue'].includes(campagne.statut);

  if (modeEdition) {
    return <FormulaireEdition campagne={campagne} onTermine={() => { setModeEdition(false); charger(); }} onAnnuler={() => setModeEdition(false)} />;
  }

  return (
    <div>
      <Link to="/mes-campagnes" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>← Retour à mes campagnes</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 }}>
        <div>
          <h1 className="page-title">{campagne.titre}</h1>
          <p className="subtitle">{campagne.categorie || 'Sans catégorie'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tag" style={estTerminee ? { background: 'rgba(255,177,0,0.2)' } : {}}>
            {estTerminee ? '✓ Terminée' : (LABELS_STATUT_CAMPAGNE[campagne.statut] || campagne.statut)}
          </span>
          {estBrouillon && (
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setModeEdition(true)}>Modifier</button>
          )}
        </div>
      </div>

      {estBrouillon && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--coral)' }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--coral)' }}>
            Cette campagne n'est pas encore visible des créateurs — les fonds n'ont pas été déposés.
          </p>
          <button className="btn btn-primary" disabled={action === 'depot'} onClick={deposerFonds}>
            {action === 'depot' ? 'Traitement...' : 'Déposer les fonds (démo) et publier'}
          </button>
        </div>
      )}

      {estActiveOuSuspendue && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-ghost" disabled={action === 'suspension'} onClick={basculerSuspension}>
            {action === 'suspension' ? '...' : campagne.statut === 'active' ? '⏸ Suspendre la campagne' : '▶ Réactiver la campagne'}
          </button>
          {campagne.statut === 'suspendue' && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Campagne masquée du marketplace tant qu'elle est suspendue.</p>
          )}
        </div>
      )}

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
                  <td>
                    <span onClick={() => setCreateurOuvert(s.createur_id)} style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}>
                      {s.createur_nom}
                    </span>
                  </td>
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

      {createurOuvert && <PanneauProfilCreateur id={createurOuvert} onFermer={() => setCreateurOuvert(null)} />}
    </div>
  );
}

function FormulaireEdition({ campagne, onTermine, onAnnuler }) {
  const [form, setForm] = useState({
    titre: campagne.titre,
    categorie: campagne.categorie || '',
    cpm: campagne.cpm,
    budget_total: campagne.budget_total,
    brief: campagne.brief || '',
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  function update(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function enregistrer(e) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.patch(`/campagnes/${campagne.id}`, {
        ...form,
        cpm: Number(form.cpm),
        budget_total: Number(form.budget_total),
      });
      onTermine();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la modification.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <button onClick={onAnnuler} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
        ← Annuler la modification
      </button>
      <h1 className="page-title">Modifier la campagne</h1>
      <p className="subtitle">Uniquement possible tant que les fonds ne sont pas déposés.</p>

      {erreur && <div className="error-banner">{erreur}</div>}

      <form onSubmit={enregistrer} style={{ maxWidth: 480 }}>
        <label>Titre</label>
        <input value={form.titre} onChange={(e) => update('titre', e.target.value)} required />

        <div className="row2">
          <div>
            <label>Catégorie</label>
            <input value={form.categorie} onChange={(e) => update('categorie', e.target.value)} />
          </div>
          <div>
            <label>CPM (FCFA)</label>
            <input type="number" min="1" value={form.cpm} onChange={(e) => update('cpm', e.target.value)} required />
          </div>
        </div>

        <label>Budget total (FCFA)</label>
        <input type="number" min="1" value={form.budget_total} onChange={(e) => update('budget_total', e.target.value)} required />

        <label>Brief créatif</label>
        <textarea value={form.brief} onChange={(e) => update('brief', e.target.value)} />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onAnnuler}>Annuler</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={envoi}>{envoi ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}

function PanneauProfilCreateur({ id, onFermer }) {
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/createurs/${id}/profil`);
        setProfil(data);
      } catch (err) {
        // silencieux, le panneau affichera juste rien de plus
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  return (
    <div
      onClick={onFermer}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
    >
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 380, width: '90%', marginBottom: 0 }}>
        {chargement && <p style={{ color: 'var(--muted)', margin: 0 }}>Chargement...</p>}
        {profil && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{profil.nom}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Membre depuis {new Date(profil.membre_depuis).toLocaleDateString('fr-FR')}</div>
              </div>
              <button onClick={onFermer} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <MiniStat label="Soumissions totales" valeur={profil.nombre_soumissions_total} />
              <MiniStat label="Terminées" valeur={profil.nombre_terminees} accent="gold" />
              <MiniStat label="Rejetées" valeur={profil.nombre_rejetees} accent={profil.nombre_rejetees > 0 ? 'coral' : null} />
              <MiniStat label="Taux d'approbation" valeur={profil.taux_approbation !== null ? `${profil.taux_approbation}%` : '—'} accent="gold" />
            </div>
            <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--muted)' }}>
              Vues cumulées (toutes campagnes) : <span className="mono" style={{ color: 'var(--cream)' }}>{fmt(profil.vues_cumulees)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, valeur, accent }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
      <div className={`mono ${accent === 'gold' ? 'gold' : accent === 'coral' ? 'coral' : ''}`} style={{ fontSize: 17, fontWeight: 600 }}>{valeur}</div>
      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
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