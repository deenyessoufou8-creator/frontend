import { Link } from 'react-router-dom';
import { useState } from 'react';

const QUESTIONS = [
  {
    q: "Comment sont calculés mes gains en tant que créateur ?",
    r: "Tes gains dépendent du nombre de vues réelles générées par ta publication, selon le CPM (prix pour 1000 vues) fixé par la marque pour sa campagne. Formule : (vues / 1000) × CPM. Le calcul se met à jour au fur et à mesure que les vues augmentent, jusqu'à épuisement du budget de la campagne.",
  },
  {
    q: "Pourquoi mes gains restent \"en attente\" avant d'être disponibles ?",
    r: "C'est un délai de sécurité anti-fraude (quelques jours) qui permet de détecter d'éventuelles vues achetées ou un contenu supprimé après validation, avant que l'argent ne devienne réellement retirable.",
  },
  {
    q: "Quel est le montant minimum de retrait ?",
    r: "Un montant minimum est fixé par la plateforme pour éviter les micro-retraits impossibles à traiter efficacement. Le montant exact est indiqué directement dans le formulaire de retrait de ton tableau de bord.",
  },
  {
    q: "Ma soumission a été rejetée, pourquoi ?",
    r: "Chaque rejet est accompagné d'un motif écrit par l'équipe de modération, visible directement dans ton tableau de bord à côté de la soumission concernée. Les raisons courantes : contenu ne respectant pas le brief, hashtags manquants, ou soupçon de vues anormales.",
  },
  {
    q: "Comment fonctionne la commission prélevée aux marques ?",
    r: "Fanka prélève une commission sur le budget déposé par la marque, au moment du dépôt — pas sur les gains du créateur. Le CPM affiché au créateur est donc bien le montant qu'il touche réellement par 1000 vues.",
  },
  {
    q: "Qui voit mes informations personnelles ?",
    r: "Ton nom et tes statistiques de performance (vues, taux d'approbation) sont visibles par les marques dont tu rejoins les campagnes, pour établir la confiance. Ton téléphone, ton email et ton adresse ne sont jamais partagés avec une marque — seule l'équipe Fanka (admin) y a accès.",
  },
  {
    q: "Que se passe-t-il en cas de désaccord avec une marque ou un créateur ?",
    r: "L'une ou l'autre partie peut ouvrir un litige directement depuis une soumission concernée. L'équipe Fanka examine le dossier et tranche en faveur de l'une des parties, avec une explication écrite.",
  },
  {
    q: "Les paiements sont-ils réels actuellement ?",
    r: "La plateforme est actuellement en phase de test : les dépôts et retraits Mobile Money sont simulés en attendant l'intégration complète d'un partenaire de paiement agréé. Ceci sera clairement indiqué sur les écrans concernés.",
  },
];

export default function FAQ() {
  const [ouverte, setOuverte] = useState(null);

  return (
    <div className="app-shell" style={{ maxWidth: 720, padding: '40px 20px' }}>
      <Link to="/connexion" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>← Retour</Link>
      <h1 className="page-title" style={{ marginTop: 16 }}>Foire aux questions</h1>
      <p className="subtitle">Les réponses aux questions les plus fréquentes.</p>

      <div>
        {QUESTIONS.map((item, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => setOuverte(ouverte === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{item.q}</div>
              <span style={{ color: 'var(--gold)', fontSize: 18 }}>{ouverte === i ? '−' : '+'}</span>
            </div>
            {ouverte === i && (
              <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>{item.r}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}