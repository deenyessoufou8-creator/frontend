import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function fmt(n) {
  return Math.round(Number(n)).toLocaleString('fr-FR');
}

export default function TableauDeBordMarque() {
  const { utilisateur } = useAuth();
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/campagnes/tableau-de-bord');
        setDonnees(data);
      } catch (err) {
        setErreur('Impossible de charger le tableau de bord.');
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="page-title">Salut, {utilisateur.nom.split(' ')[0]} 👋</h1>
      <p className="subtitle">Vue d'ensemble de toutes tes campagnes.</p>

      {erreur && <div className="error-banner">{erreur}</div>}
      {chargement && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}

      {donnees && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Campagnes actives" valeur={donnees.campagnes_actives} accent="gold" />
            <StatCard label="Campagnes terminées" valeur={donnees.campagnes_terminees} />
            <StatCard label="Brouillons" valeur={donnees.campagnes_brouillon} />
            <StatCard label="Total campagnes" valeur={donnees.total_campagnes} />
          </div>

          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="hero-label">BUDGET DÉPLOYÉ (total)</div>
              <div className="hero-value" style={{ fontSize: 26 }}>{fmt(donnees.budget_total_deploye)} FCFA</div>
              <div className="hero-sub">dont {fmt(donnees.budget_distribue)} FCFA effectivement distribués aux créateurs</div>
            </div>
            <div className="card">
              <div className="hero-label">COMMISSION PAYÉE À LA PLATEFORME</div>
              <div className="hero-value" style={{ fontSize: 26 }}>{fmt(donnees.commission_totale)} FCFA</div>
            </div>
            <div className="card">
              <div className="hero-label">VUES CUMULÉES GÉNÉRÉES</div>
              <div className="hero-value" style={{ fontSize: 26 }}>{fmt(donnees.vues_cumulees)}</div>
              <div className="hero-sub">
                Coût moyen réel : {donnees.vues_cumulees > 0 ? fmt(donnees.cout_moyen_pour_1000_vues) : '—'} FCFA / 1000 vues
              </div>
            </div>
          </div>

          <h1 className="page-title" style={{ fontSize: 17, marginBottom: 14 }}>Top créateurs sur tes campagnes</h1>
          <div className="card">
            {donnees.top_createurs.length === 0 && (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Aucun créateur n'a encore contribué à tes campagnes.</p>
            )}
            {donnees.top_createurs.length > 0 && (
              <table>
                <thead>
                  <tr><th>Créateur</th><th>Vues générées</th><th>Gains</th></tr>
                </thead>
                <tbody>
                  {donnees.top_createurs.map((c, i) => (
                    <tr key={i}>
                      <td>{c.nom}</td>
                      <td className="mono">{fmt(c.vues)}</td>
                      <td className="mono gold">{fmt(c.gains)} F</td>
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

function StatCard({ label, valeur, accent }) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 0, textAlign: 'center' }}>
      <div className={`mono ${accent === 'gold' ? 'gold' : ''}`} style={{ fontSize: 22, fontWeight: 600 }}>{valeur}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
