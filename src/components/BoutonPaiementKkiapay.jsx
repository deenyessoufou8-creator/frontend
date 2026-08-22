import { useEffect, useState, useRef } from 'react';
import api from '../api/client';

const KKIAPAY_PUBLIC_KEY = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
const KKIAPAY_SANDBOX = import.meta.env.VITE_KKIAPAY_SANDBOX !== 'false';

export default function BoutonPaiementKkiapay({ campagneId, montant, onSucces, onErreur }) {
  const [enCours, setEnCours] = useState(false);
  const [pret, setPret] = useState(false);
  const listenerAjoute = useRef(false);

  useEffect(() => {
    if (document.getElementById('kkiapay-script')) {
      setPret(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'kkiapay-script';
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.onload = () => setPret(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!pret || listenerAjoute.current || !window.addSuccessListener) return;
    listenerAjoute.current = true;
    window.addSuccessListener(({ transactionId }) => {
      confirmerCotéBackend(transactionId);
    });
  }, [pret]);

  async function confirmerCotéBackend(transactionId) {
    setEnCours(true);
    try {
      const { data } = await api.post(`/campagnes/${campagneId}/deposer-fonds`, { transactionId });
      onSucces?.(data);
    } catch (err) {
      onErreur?.(
        err.response?.data?.erreur ||
        `Le paiement a été reçu par Kkiapay mais la confirmation a échoué. Contacte le support avec cette référence : ${transactionId}`
      );
    } finally {
      setEnCours(false);
    }
  }

  function ouvrirWidget() {
    if (!window.openKkiapayWidget) {
      onErreur?.("Le module de paiement n'a pas encore fini de se charger. Réessaie dans quelques secondes.");
      return;
    }
    window.openKkiapayWidget({
      amount: Math.round(montant),
      key: KKIAPAY_PUBLIC_KEY,
      sandbox: KKIAPAY_SANDBOX,
      data: JSON.stringify({ campagneId }),
    });
  }

  return (
    <button className="btn btn-primary" disabled={enCours || !pret} onClick={ouvrirWidget}>
      {enCours ? 'Confirmation en cours...' : `Payer ${Math.round(montant).toLocaleString('fr-FR')} FCFA via Mobile Money`}
    </button>
  );
}