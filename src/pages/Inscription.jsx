import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatsBadge from '../components/StatsBadge';
import PAYS_AFRIQUE from '../data/paysAfrique';

export default function Inscription() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('createur');
  const [form, setForm] = useState({
    nom: '', telephoneLocal: '', email: '', mot_de_passe: '', nom_entreprise: '',
    prenom: '', pays: 'Bénin', indicatif: '+229', adresse: '',
  });
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  function update(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  // Quand le pays change, l'indicatif se met à jour automatiquement pour
  // correspondre — l'utilisateur peut toujours le changer séparément si
  // besoin (ex: diaspora avec un numéro d'un autre pays).
  function onChangePays(nomPays) {
    const pays = PAYS_AFRIQUE.find((p) => p.nom === nomPays);
    setForm((f) => ({ ...f, pays: nomPays, indicatif: pays ? pays.indicatif : f.indicatif }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const telephone = role === 'createur'
        ? `${form.indicatif}${form.telephoneLocal.replace(/^0+/, '')}`
        : form.telephoneLocal;

      await inscription({
        role,
        nom: form.nom,
        telephone,
        email: form.email,
        mot_de_passe: form.mot_de_passe,
        nom_entreprise: form.nom_entreprise,
        prenom: form.prenom,
        pays: form.pays,
        adresse: form.adresse,
      });
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
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><StatsBadge /></div>

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

            <label>Téléphone</label>
            <input type="tel" value={form.telephoneLocal} onChange={(e) => update('telephoneLocal', e.target.value)} placeholder="+229 xx xx xx xx" required />
          </>
        )}

        {role === 'createur' && (
          <>
            <label>Prénom (optionnel, tu peux le compléter plus tard)</label>
            <input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} />

            <label>Pays</label>
            <select value={form.pays} onChange={(e) => onChangePays(e.target.value)}>
              {PAYS_AFRIQUE.map((p) => (
                <option key={p.nom} value={p.nom}>{p.nom}</option>
              ))}
            </select>

            <label>Téléphone</label>
            <div className="row2">
              <div style={{ flex: '0 0 110px' }}>
                <select value={form.indicatif} onChange={(e) => update('indicatif', e.target.value)}>
                  {PAYS_AFRIQUE.map((p) => (
                    <option key={p.nom} value={p.indicatif}>{p.indicatif}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="tel"
                  value={form.telephoneLocal}
                  onChange={(e) => update('telephoneLocal', e.target.value)}
                  placeholder="97 00 00 00 (sans le 0 initial)"
                  required
                />
              </div>
            </div>

            <label>Adresse (optionnel)</label>
            <input value={form.adresse} onChange={(e) => update('adresse', e.target.value)} placeholder="Ville, quartier..." />
          </>
        )}

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
      <div className="center-link" style={{ marginTop: 8, fontSize: 11 }}>
        <Link to="/cgu" style={{ color: 'var(--muted)' }}>CGU</Link>
        {' · '}
        <Link to="/confidentialite" style={{ color: 'var(--muted)' }}>Confidentialité</Link>
        {' · '}
        <Link to="/faq" style={{ color: 'var(--muted)' }}>FAQ</Link>
      </div>
    </div>
  );
}