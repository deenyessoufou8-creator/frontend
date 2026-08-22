import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BoutonPaiementKkiapay from '../components/BoutonPaiementKkiapay';

const TAUX_COMMISSION = 0.10; // affiché à titre indicatif ; le calcul réel est fait côté serveur
const PLATEFORMES = ['tiktok', 'reels', 'shorts', 'x'];

function fmt(n) {
  return Math.round(n).toLocaleString('fr-FR');
}

export default function CreerCampagne() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: '', categorie: 'Mode', brief: '', cpm: 450, budget_total: 250000,
  });
  const [plateformesSel, setPlateformesSel] = useState(['tiktok', 'reels']);
  const [etape, setEtape] = useState('formulaire'); // formulaire | confirmation | fait
  const [campagneCreee, setCampagneCreee] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  function update(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }
  function togglePlateforme(p) {
    setPlateformesSel((sel) => (sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p]));
  }

  const recap = useMemo(() => {
    const budget = Number(form.budget_total) || 0;
    const commission = budget * TAUX_COMMISSION;
    const net = budget - commission;
    const cpm = Number(form.cpm) || 1;
    const vues = (net / cpm) * 1000;
    return { budget, commission, net, vues };
  }, [form.budget_total, form.cpm]);

  async function creerCampagne(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const { data } = await api.post('/campagnes', {
        ...form,
        cpm: Number(form.cpm),
        budget_total: Number(form.budget_total),
        plateformes: plateformesSel,
      });
      setCampagneCreee(data);
      setEtape('confirmation');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création.');
    } finally {
      setChargement(false);
    }
  }



  if (etape === 'fait') {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <h1 className="page-title">Campagne publiée 🎉</h1>
        <p className="subtitle">Elle est maintenant visible dans le marketplace des créateurs.</p>
        <button className="btn btn-primary" onClick={() => navigate('/mes-campagnes')}>Voir mes campagnes</button>
      </div>
    );
  }

  if (etape === 'confirmation') {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <h1 className="page-title">Déposer les fonds</h1>
        <p className="subtitle">Paiement sécurisé via Mobile Money (Kkiapay).</p>
        {erreur && <div className="error-banner">{erreur}</div>}
        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginBottom: 16 }}>
          <span>Budget à déposer</span><span className="mono">{fmt(recap.budget)} FCFA</span>
        </div>
        <BoutonPaiementKkiapay
          campagneId={campagneCreee.id}
          montant={recap.budget}
          onSucces={() => setEtape('fait')}
          onErreur={(msg) => setErreur(msg)}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Nouvelle campagne</h1>
      <p className="subtitle">Configure ta campagne, on calcule le reste.</p>

      {erreur && <div className="error-banner">{erreur}</div>}

      <form onSubmit={creerCampagne} style={{ maxWidth: 520 }}>
        <label>Titre de la campagne</label>
        <input value={form.titre} onChange={(e) => update('titre', e.target.value)} placeholder="Ex : Lancement collection Harmattan" required />

        <div className="row2">
          <div>
            <label>Catégorie</label>
            <select value={form.categorie} onChange={(e) => update('categorie', e.target.value)}>
              <option>Mode</option><option>Sport</option><option>Food</option><option>Musique</option><option>Gaming</option>
            </select>
          </div>
          <div>
            <label>CPM (FCFA)</label>
            <input type="number" min="1" value={form.cpm} onChange={(e) => update('cpm', e.target.value)} required />
          </div>
        </div>

        <label>Budget total (FCFA)</label>
        <input type="number" min="1" value={form.budget_total} onChange={(e) => update('budget_total', e.target.value)} required />

        <label>Plateformes acceptées</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PLATEFORMES.map((p) => (
            <div
              key={p}
              onClick={() => togglePlateforme(p)}
              style={{
                padding: '8px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 12,
                border: `1px solid ${plateformesSel.includes(p) ? 'var(--gold)' : 'var(--line)'}`,
                color: plateformesSel.includes(p) ? 'var(--gold)' : 'var(--muted)',
                background: plateformesSel.includes(p) ? 'rgba(255,177,0,0.08)' : 'transparent',
              }}
            >
              {p}
            </div>
          ))}
        </div>

        <label>Brief créatif</label>
        <textarea value={form.brief} onChange={(e) => update('brief', e.target.value)} placeholder="Consignes, hashtags, ton à respecter..." />

        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', padding: '6px 0' }}>
            <span>Budget déposé</span><span className="mono" style={{ color: 'var(--cream)' }}>{fmt(recap.budget)} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', padding: '6px 0' }}>
            <span>Commission plateforme (10%)</span><span className="mono" style={{ color: 'var(--cream)' }}>{fmt(recap.commission)} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', padding: '6px 0' }}>
            <span>Distribué aux créateurs</span><span className="mono" style={{ color: 'var(--cream)' }}>{fmt(recap.net)} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 4 }}>
            <span>Vues estimées</span><span className="mono gold">≈ {fmt(recap.vues)} vues</span>
          </div>
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={chargement || plateformesSel.length === 0}>
          {chargement ? 'Création...' : 'Créer la campagne'}
        </button>
      </form>
    </div>
  );
}
