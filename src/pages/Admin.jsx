import { useEffect, useState } from 'react';
import api from '../api/client';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

const ONGLETS = [
  { id: 'en_attente', label: 'À approuver' },
  { id: 'en_comptage', label: 'Simuler des vues (test)' },
  { id: 'litiges', label: 'Litiges' },
  { id: 'retraits', label: 'Retraits' },
  { id: 'bilan', label: 'Bilan des comptes' },
];

export default function Admin() {
  const [onglet, setOnglet] = useState('en_attente');

  return (
    <div>
      <h1 className="page-title">Espace admin</h1>
      <p className="subtitle">Modération, outils de test, et vue d'ensemble de la plateforme.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className="btn"
            style={{
              background: onglet === o.id ? 'var(--gold)' : 'var(--surface)',
              color: onglet === o.id ? '#1a1200' : 'var(--cream)',
              border: '1px solid var(--line)',
            }}
            onClick={() => setOnglet(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

            {(onglet === 'en_attente' || onglet === 'en_comptage') && <OngletSoumissions statut={onglet} />}
      {onglet === 'litiges' && <OngletLitiges />}
      {onglet === 'retraits' && <OngletRetraits />}
      {onglet === 'bilan' && <OngletBilan />}
    </div>
  );
}
function OngletRetraits() {
  const [retraits, setRetraits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/admin/retraits', { params: { statut: 'en_attente' } });
      setRetraits(data);
    } catch (err) {
      setErreur('Impossible de charger les retraits.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, []);

  async function marquerPaye(id) {
    setEnCours(id);
    try {
      await api.patch(`/admin/retraits/${id}/marquer-paye`);
      setRetraits((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la confirmation.');
    } finally {
      setEnCours(null);
    }
  }

  async function marquerEchoue(id) {
    const motif = window.prompt("Pourquoi ce retrait a-t-il échoué ? (le créateur sera remboursé automatiquement)");
    if (!motif) return;
    setEnCours(id);
    try {
      await api.patch(`/admin/retraits/${id}/marquer-echoue`, { motif });
      setRetraits((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du traitement.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>
        Envoie manuellement le montant via ton application Mobile Money vers le numéro indiqué, puis confirme ici.
      </p>
      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}
      {!chargement && retraits.length === 0 && <p style={{ color: 'var(--muted)' }}>Aucun retrait en attente. 🎉</p>}

      <div className="grid">
        {retraits.map((r) => (
          <div className="card" key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>{r.createur_nom}</div>
              <span className="tag">{r.methode_paiement?.replace('_', ' ') || 'mobile money'}</span>
            </div>
            <div className="hero-value" style={{ fontSize: 22, marginBottom: 6 }}>
              {Math.round(r.montant).toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
              Vers : <span className="mono" style={{ color: 'var(--cream)' }}>{r.createur_telephone}</span>
              <br />
              Demandé le {new Date(r.cree_le).toLocaleString('fr-FR')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={enCours === r.id} onClick={() => marquerPaye(r.id)}>
                {enCours === r.id ? '...' : '✓ Marquer payé'}
              </button>
              <button className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--coral)', color: 'var(--coral)' }} disabled={enCours === r.id} onClick={() => marquerEchoue(r.id)}>
                Échoué
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OngletSoumissions({ statut }) {
  const [soumissions, setSoumissions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function charger() {
    setChargement(true);
    setErreur(null);
    try {
      const { data } = await api.get('/soumissions', { params: { statut } });
      setSoumissions(data);
    } catch (err) {
      setErreur('Impossible de charger les soumissions.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, [statut]);

  async function traiter(id, decision) {
    setEnCours(id);
    let motif_rejet;
    if (decision === 'rejetee') {
      motif_rejet = window.prompt('Motif du rejet :');
      if (!motif_rejet) { setEnCours(null); return; }
    }
    try {
      await api.patch(`/soumissions/${id}/review`, { decision, motif_rejet });
      setSoumissions((s) => s.filter((sub) => sub.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du traitement.');
    } finally {
      setEnCours(null);
    }
  }

  async function simulerVues(id, vues) {
    setEnCours(id);
    try {
      await api.patch(`/soumissions/${id}/simuler-vues`, { vues: Number(vues) });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la simulation.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <>
      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}
      {!chargement && soumissions.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          {statut === 'en_attente' ? 'Aucune soumission en attente. 🎉' : 'Aucune soumission en cours de comptage.'}
        </p>
      )}

      <div className="grid">
        {soumissions.map((s) => (
          <div className="card" key={s.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>{s.campagne_titre}</div>
              <span className="tag">{statut === 'en_attente' ? 'En attente' : 'En comptage'}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>
              Soumis par {s.createur_nom} · {s.plateforme} · {new Date(s.soumise_le).toLocaleString('fr-FR')}
            </div>
            <a href={s.lien_contenu} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: 'var(--gold)', display: 'block', marginBottom: 14, wordBreak: 'break-all' }}>
              {s.lien_contenu}
            </a>

            {statut === 'en_attente' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={enCours === s.id} onClick={() => traiter(s.id, 'approuvee')}>
                  Approuver
                </button>
                <button className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--coral)', color: 'var(--coral)' }} disabled={enCours === s.id} onClick={() => traiter(s.id, 'rejetee')}>
                  Rejeter
                </button>
              </div>
            )}

            {statut === 'en_comptage' && (
              <FormulaireSimulationVues
                soumission={s}
                enCours={enCours === s.id}
                onSimuler={(vues) => simulerVues(s.id, vues)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function FormulaireSimulationVues({ soumission, enCours, onSimuler }) {
  const [vues, setVues] = useState(Number(soumission.vues_actuelles) + 5000);

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        Vues actuelles : <span className="mono" style={{ color: 'var(--cream)' }}>{fmt(soumission.vues_actuelles)}</span>
        {' · '}Gains actuels : <span className="mono gold">{fmt(soumission.gains_calcules)} F</span>
      </div>
      <label style={{ margin: '0 0 6px' }}>Nouveau total de vues (simulé)</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="number" min="0" value={vues} onChange={(e) => setVues(e.target.value)} />
        <button className="btn btn-primary" disabled={enCours} onClick={() => onSimuler(vues)}>
          {enCours ? '...' : 'Simuler'}
        </button>
      </div>
    </div>
  );
}

function OngletLitiges() {
  const [litiges, setLitiges] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/admin/litiges', { params: { statut: 'ouvert' } });
      setLitiges(data);
    } catch (err) {
      setErreur('Impossible de charger les litiges.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, []);

  async function trancher(id, statut) {
    const resolution = window.prompt(
      statut === 'resolu_marque'
        ? "Explique pourquoi la marque a raison :"
        : "Explique pourquoi le créateur a raison :"
    );
    if (!resolution) return;
    setEnCours(id);
    try {
      await api.patch(`/admin/litiges/${id}/resoudre`, { statut, resolution });
      setLitiges((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la résolution.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div>
      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}
      {!chargement && litiges.length === 0 && <p style={{ color: 'var(--muted)' }}>Aucun litige ouvert. 🎉</p>}

      <div className="grid">
        {litiges.map((l) => (
          <div className="card" key={l.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>{l.campagne_titre}</div>
              <span className="tag" style={{ background: 'rgba(255,90,69,0.12)', color: 'var(--coral)', borderColor: 'rgba(255,90,69,0.3)' }}>Litige ouvert</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>
              {l.nom_entreprise} vs {l.createur_nom} · ouvert par {l.ouvert_par_nom} ({l.ouvert_par_role}) le {new Date(l.cree_le).toLocaleDateString('fr-FR')}
            </div>
            <div style={{ fontSize: 13, marginBottom: 10, background: 'var(--surface-2)', borderRadius: 10, padding: 10 }}>
              « {l.motif} »
            </div>
            <a href={l.lien_contenu} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--gold)', display: 'block', marginBottom: 14, wordBreak: 'break-all' }}>
              {l.lien_contenu}
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={enCours === l.id} onClick={() => trancher(l.id, 'resolu_marque')}>
                Raison à la marque
              </button>
              <button className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--line)', color: 'var(--cream)' }} disabled={enCours === l.id} onClick={() => trancher(l.id, 'resolu_createur')}>
                Raison au créateur
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OngletBilan() {
  const [bilan, setBilan] = useState(null);
  const [marques, setMarques] = useState([]);
  const [createurs, setCreateurs] = useState([]);
  const [sousOnglet, setSousOnglet] = useState('marques');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [marqueSelectionnee, setMarqueSelectionnee] = useState(null);
  const [createurSelectionne, setCreateurSelectionne] = useState(null);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const [bilanRes, marquesRes, createursRes] = await Promise.all([
          api.get('/admin/bilan'),
          api.get('/admin/marques'),
          api.get('/admin/createurs'),
        ]);
        setBilan(bilanRes.data);
        setMarques(marquesRes.data);
        setCreateurs(createursRes.data);
      } catch (err) {
        setErreur('Impossible de charger le bilan des comptes.');
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  if (erreur) return <div className="error-banner">{erreur}</div>;
  if (chargement) return <p style={{ color: 'var(--muted)' }}>Chargement...</p>;
  if (!bilan) return null;

  if (marqueSelectionnee) return <DetailMarqueAdmin id={marqueSelectionnee} onRetour={() => setMarqueSelectionnee(null)} />;
  if (createurSelectionne) return <DetailCreateurAdmin id={createurSelectionne} onRetour={() => setCreateurSelectionne(null)} />;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Marques" valeur={bilan.comptes.marque} accent="gold" />
        <StatCard label="Créateurs" valeur={bilan.comptes.createur} accent="gold" />
        <StatCard label="Admins" valeur={bilan.comptes.admin} />
        <StatCard label="Campagnes (total)" valeur={bilan.campagnes.total_campagnes} />
        <StatCard label="Campagnes actives" valeur={bilan.campagnes.actives} />
      </div>

      <div className="grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="hero-label">BUDGET TOTAL DÉPLOYÉ (plateforme)</div>
          <div className="hero-value" style={{ fontSize: 24 }}>{fmt(bilan.campagnes.budget_total_deploye)} FCFA</div>
          <div className="hero-sub">dont {fmt(bilan.campagnes.budget_distribue)} FCFA distribués aux créateurs</div>
        </div>
        <div className="card">
          <div className="hero-label">COMMISSION TOTALE PERÇUE</div>
          <div className="hero-value" style={{ fontSize: 24 }}>{fmt(bilan.commission_totale)} FCFA</div>
        </div>
        <div className="card">
          <div className="hero-label">VUES CUMULÉES (plateforme)</div>
          <div className="hero-value" style={{ fontSize: 24 }}>{fmt(bilan.vues_cumulees)}</div>
        </div>
        <div className="card">
          <div className="hero-label">WALLETS CRÉATEURS</div>
          <div className="hero-value" style={{ fontSize: 24 }}>{fmt(bilan.wallet_solde_total)} FCFA</div>
          <div className="hero-sub">+ {fmt(bilan.wallet_en_attente_total)} FCFA en attente · {fmt(bilan.total_retraits)} FCFA déjà retirés</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          className="btn"
          style={{ background: sousOnglet === 'marques' ? 'var(--surface-2)' : 'transparent', border: '1px solid var(--line)', color: sousOnglet === 'marques' ? 'var(--gold)' : 'var(--muted)' }}
          onClick={() => setSousOnglet('marques')}
        >
          Marques ({marques.length})
        </button>
        <button
          className="btn"
          style={{ background: sousOnglet === 'createurs' ? 'var(--surface-2)' : 'transparent', border: '1px solid var(--line)', color: sousOnglet === 'createurs' ? 'var(--gold)' : 'var(--muted)' }}
          onClick={() => setSousOnglet('createurs')}
        >
          Créateurs ({createurs.length})
        </button>
      </div>

      {sousOnglet === 'marques' && (
        <div className="card">
          {marques.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucune marque inscrite.</p>}
          {marques.length > 0 && (
            <table>
              <thead>
                <tr><th>Entreprise</th><th>Contact</th><th>Campagnes</th><th>Budget cumulé</th><th>Inscrit le</th></tr>
              </thead>
              <tbody>
                {marques.map((m) => (
                  <tr key={m.id} onClick={() => setMarqueSelectionnee(m.id)} style={{ cursor: 'pointer' }}>
                    <td>{m.nom_entreprise}</td>
                    <td style={{ color: 'var(--muted)' }}>{m.telephone}</td>
                    <td className="mono">{m.nombre_campagnes}</td>
                    <td className="mono gold">{fmt(m.budget_total_deploye)} F</td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(m.cree_le).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {sousOnglet === 'createurs' && (
        <div className="card">
          {createurs.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucun créateur inscrit.</p>}
          {createurs.length > 0 && (
            <table>
              <thead>
                <tr><th>Nom</th><th>Contact</th><th>Pays</th><th>Soumissions</th><th>Vues</th><th>Solde</th><th>En attente</th></tr>
              </thead>
              <tbody>
                {createurs.map((c) => (
                  <tr key={c.id} onClick={() => setCreateurSelectionne(c.id)} style={{ cursor: 'pointer' }}>
                    <td>{c.prenom ? `${c.prenom} ${c.nom}` : c.nom}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.telephone}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.pays || '—'}</td>
                    <td className="mono">{c.nombre_soumissions}</td>
                    <td className="mono">{fmt(c.vues_cumulees)}</td>
                    <td className="mono gold">{fmt(c.wallet_solde)} F</td>
                    <td className="mono" style={{ color: 'var(--muted)' }}>{fmt(c.wallet_en_attente)} F</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const LABELS_STATUT_CAMPAGNE = {
  brouillon: 'Brouillon', fonds_bloques: 'Fonds bloqués', active: 'Active', suspendue: 'Suspendue', terminee: 'Terminée',
};
const LABELS_STATUT_SOUMISSION = {
  en_attente: 'En attente', approuvee: 'Approuvée', rejetee: 'Rejetée',
  en_comptage: 'En comptage', verrouillee: 'Terminée', payee: 'Payée',
};

function DetailMarqueAdmin({ id, onRetour }) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [campagneSelectionnee, setCampagneSelectionnee] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/admin/marques/${id}`);
        setDonnees(data);
      } catch (err) {
        setErreur('Impossible de charger cette marque.');
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  if (campagneSelectionnee) {
    return <DetailCampagneAdmin id={campagneSelectionnee} onRetour={() => setCampagneSelectionnee(null)} />;
  }

  return (
    <div>
      <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
        ← Retour au bilan
      </button>
      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}
      {donnees && (
        <>
          <h1 className="page-title">{donnees.info.nom_entreprise}</h1>
          <p className="subtitle">{donnees.info.nom} · {donnees.info.telephone} · inscrit le {new Date(donnees.info.cree_le).toLocaleDateString('fr-FR')}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Campagnes" valeur={donnees.campagnes.length} />
            <StatCard label="Vues cumulées" valeur={fmt(donnees.vues_cumulees)} accent="gold" />
            <StatCard label="Commission versée" valeur={`${fmt(donnees.commission_totale)} F`} accent="gold" />
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Clique sur une campagne pour voir son détail complet.</p>
          <div className="card">
            {donnees.campagnes.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucune campagne créée.</p>}
            {donnees.campagnes.length > 0 && (
              <table>
                <thead><tr><th>Titre</th><th>Statut</th><th>CPM</th><th>Budget restant</th></tr></thead>
                <tbody>
                  {donnees.campagnes.map((c) => (
                    <tr key={c.id} onClick={() => setCampagneSelectionnee(c.id)} style={{ cursor: 'pointer' }}>
                      <td>{c.titre}</td>
                      <td>{LABELS_STATUT_CAMPAGNE[c.statut] || c.statut}</td>
                      <td className="mono">{fmt(c.cpm)} F</td>
                      <td className="mono">{fmt(c.budget_restant)} / {fmt(c.budget_total)} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DetailCreateurAdmin({ id, onRetour }) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/admin/createurs/${id}`);
        setDonnees(data);
      } catch (err) {
        setErreur('Impossible de charger ce créateur.');
      } finally {
        setChargement(false);
      }
    })();
  }, [id]);

  return (
    <div>
      <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
        ← Retour au bilan
      </button>
      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}
      {donnees && (
        <>
          <h1 className="page-title">{donnees.info.prenom ? `${donnees.info.prenom} ${donnees.info.nom}` : donnees.info.nom}</h1>
          <p className="subtitle">{donnees.info.telephone} · inscrit le {new Date(donnees.info.cree_le).toLocaleDateString('fr-FR')}</p>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Email</div><div style={{ fontSize: 13 }}>{donnees.info.email || '—'}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Pays</div><div style={{ fontSize: 13 }}>{donnees.info.pays || '—'}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Adresse</div><div style={{ fontSize: 13 }}>{donnees.info.adresse || '—'}</div></div>
            </div>
          </div>

          <div className="hero-ticket">
            <div className="hero-label">SOLDE DISPONIBLE</div>
            <div className="hero-value">{fmt(donnees.info.wallet_solde)} FCFA</div>
            <div className="hero-sub">+ {fmt(donnees.info.wallet_en_attente)} FCFA en attente</div>
          </div>

          <h1 className="page-title" style={{ fontSize: 16, marginBottom: 12 }}>Soumissions ({donnees.soumissions.length})</h1>
          <div className="card" style={{ marginBottom: 20 }}>
            {donnees.soumissions.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucune soumission.</p>}
            {donnees.soumissions.length > 0 && (
              <table>
                <thead><tr><th>Campagne</th><th>Plateforme</th><th>Statut</th><th>Vues</th><th>Gains</th></tr></thead>
                <tbody>
                  {donnees.soumissions.map((s) => (
                    <tr key={s.id}>
                      <td>{s.campagne_titre}<br /><span style={{ color: 'var(--muted)', fontSize: 11 }}>{s.nom_entreprise}</span></td>
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

          <h1 className="page-title" style={{ fontSize: 16, marginBottom: 12 }}>Historique des transactions</h1>
          <div className="card">
            {donnees.historique.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>Aucune transaction.</p>}
            {donnees.historique.length > 0 && (
              <table>
                <thead><tr><th>Type</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
                <tbody>
                  {donnees.historique.map((t, i) => (
                    <tr key={i}>
                      <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                      <td className="mono gold">{fmt(t.montant)} F</td>
                      <td style={{ textTransform: 'capitalize' }}>{t.statut.replace('_', ' ')}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(t.cree_le).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DetailCampagneAdmin({ id, onRetour }) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
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
      <button onClick={onRetour} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
        ← Retour à la marque
      </button>

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
      <div className={`mono ${accent === 'gold' ? 'gold' : ''}`} style={{ fontSize: 22, fontWeight: 600 }}>{valeur}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}