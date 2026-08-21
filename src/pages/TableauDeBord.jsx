import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

const EN_COURS = ['en_attente', 'en_comptage'];
const TERMINEES = ['verrouillee', 'payee'];

const LABELS_STATUT = {
  en_attente: 'En attente de review',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
  en_comptage: 'En cours (comptage des vues)',
  verrouillee: 'Terminée',
  payee: 'Payée',
};

export default function TableauDeBord() {
  const { utilisateur } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [soumissions, setSoumissions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [afficherRetrait, setAfficherRetrait] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const [walletRes, soumissionsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/soumissions/mes-soumissions'),
      ]);
      setWallet(walletRes.data);
      setSoumissions(soumissionsRes.data);
    } catch (err) {
      setErreur('Impossible de charger ton tableau de bord.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => { charger(); }, []);

  const stats = {
    total: soumissions.length,
    enCours: soumissions.filter((s) => EN_COURS.includes(s.statut)).length,
    terminees: soumissions.filter((s) => TERMINEES.includes(s.statut)).length,
    rejetees: soumissions.filter((s) => s.statut === 'rejetee').length,
    vuesTotal: soumissions.reduce((acc, s) => acc + Number(s.vues_actuelles || 0), 0),
  };

  return (
    <div>
      <h1 className="page-title">Salut, {utilisateur.nom.split(' ')[0]} 👋</h1>
      <p className="subtitle">Vue d'ensemble de tes campagnes et de tes gains.</p>

      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}

      {wallet && (
        <>
          <div className="hero-ticket">
            <div className="hero-label">SOLDE DISPONIBLE</div>
            <div className="hero-value">{fmt(wallet.solde_disponible)} FCFA</div>
            <div className="hero-sub">+ {fmt(wallet.solde_en_attente)} FCFA en attente (déblocage anti-fraude)</div>
          </div>

          {!afficherRetrait ? (
            <button className="btn btn-ghost" onClick={() => setAfficherRetrait(true)}>Retirer vers Mobile Money (démo)</button>
          ) : (
            <FormulaireRetrait solde={wallet.solde_disponible} onTermine={() => { setAfficherRetrait(false); charger(); }} onAnnuler={() => setAfficherRetrait(false)} />
          )}
        </>
      )}

      <h1 className="page-title" style={{ fontSize: 17, marginTop: 32, marginBottom: 14 }}>Mes campagnes en un coup d'œil</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total effectuées" valeur={stats.total} />
        <StatCard label="En cours" valeur={stats.enCours} accent="gold" />
        <StatCard label="Terminées" valeur={stats.terminees} accent="gold" />
        <StatCard label="Rejetées" valeur={stats.rejetees} accent="coral" />
        <StatCard label="Vues cumulées" valeur={fmt(stats.vuesTotal)} />
      </div>

      <h1 className="page-title" style={{ fontSize: 17, marginBottom: 14 }}>Détail de mes soumissions</h1>
      <div className="card">
        {soumissions.length === 0 && !chargement && (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Tu n'as encore rejoint aucune campagne.</p>
        )}
        {soumissions.length > 0 && (
          <table>
            <thead>
              <tr><th>Campagne</th><th>Plateforme</th><th>Statut</th><th>Vues</th><th>Gains</th><th></th></tr>
            </thead>
            <tbody>
              {soumissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.campagne_titre}<br /><span style={{ color: 'var(--muted)', fontSize: 11 }}>{s.nom_entreprise}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{s.plateforme}</td>
                  <td>
                    <span className={s.statut === 'rejetee' ? 'coral' : ''}>{LABELS_STATUT[s.statut] || s.statut}</span>
                    {s.statut === 'rejetee' && s.motif_rejet && (
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.motif_rejet}</div>
                    )}
                  </td>
                  <td className="mono">{fmt(s.vues_actuelles)}</td>
                  <td className="mono gold">{fmt(s.gains_calcules)} F</td>
                  <td><SignalerLitige soumissionId={s.id} statut={s.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {wallet && (
        <>
          <h1 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Historique des transactions</h1>
          <div className="card">
            <table>
              <thead>
                <tr><th>Type</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
              </thead>
              <tbody>
                {wallet.historique.length === 0 && (
                  <tr><td colSpan="4" style={{ color: 'var(--muted)' }}>Aucune transaction pour le moment.</td></tr>
                )}
                {wallet.historique.map((t, i) => (
                  <tr key={i}>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td className="mono gold">{fmt(t.montant)} F</td>
                    <td style={{ textTransform: 'capitalize' }}>{t.statut.replace('_', ' ')}</td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(t.cree_le).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SignalerLitige({ soumissionId, statut }) {
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const peutSignaler = ['verrouillee', 'payee', 'rejetee'].includes(statut);

  async function signaler() {
    const motif = window.prompt('Décris le problème rencontré sur cette soumission :');
    if (!motif) return;
    setEnvoi(true);
    try {
      await api.post(`/soumissions/${soumissionId}/litige`, { motif });
      setEnvoye(true);
    } catch (err) {
      alert(err.response?.data?.erreur || 'Erreur lors du signalement.');
    } finally {
      setEnvoi(false);
    }
  }

  if (!peutSignaler) return null;
  if (envoye) return <span style={{ fontSize: 11, color: 'var(--muted)' }}>Litige envoyé</span>;

  return (
    <button
      onClick={signaler}
      disabled={envoi}
      style={{ background: 'transparent', border: 'none', color: 'var(--coral)', fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
    >
      Signaler un litige
    </button>
  );
}

function StatCard({ label, valeur, accent }) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 0, textAlign: 'center' }}>
      <div className={`mono ${accent === 'gold' ? 'gold' : accent === 'coral' ? 'coral' : ''}`} style={{ fontSize: 22, fontWeight: 600 }}>
        {valeur}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FormulaireRetrait({ solde, onTermine, onAnnuler }) {
  const [montant, setMontant] = useState(Math.min(2000, solde));
  const [methode, setMethode] = useState('mtn_momo');
  const [numero, setNumero] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function demander(e) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await api.post('/wallet/retrait', { montant: Number(montant), methode_paiement: methode, numero_destinataire: numero });
      onTermine();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la demande de retrait.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <form onSubmit={demander}>
        {erreur && <div className="error-banner">{erreur}</div>}
        <label>Montant à retirer (FCFA)</label>
        <input type="number" min="1" max={solde} value={montant} onChange={(e) => setMontant(e.target.value)} required />
        <label>Méthode</label>
        <select value={methode} onChange={(e) => setMethode(e.target.value)}>
          <option value="mtn_momo">MTN Mobile Money</option>
          <option value="moov_money">Moov Money</option>
          <option value="wave">Wave</option>
        </select>
        <label>Numéro destinataire</label>
        <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="+229 xx xx xx xx" required />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onAnnuler}>Annuler</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={envoi}>{envoi ? 'Envoi...' : 'Confirmer'}</button>
        </div>
      </form>
    </div>
  );
}
