import { Link } from 'react-router-dom';

export default function CGU() {
  return (
    <div className="app-shell" style={{ maxWidth: 720, padding: '40px 20px' }}>
      <Link to="/connexion" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>← Retour</Link>
      <h1 className="page-title" style={{ marginTop: 16 }}>Conditions Générales d'Utilisation</h1>
      <p className="subtitle">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--cream)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>1. Objet</h3>
        <p style={{ color: 'var(--muted)' }}>
          Fanka est une plateforme mettant en relation des marques ("Marques") souhaitant faire la
          promotion de leurs produits ou services, et des créateurs de contenu ("Créateurs") qui
          publient du contenu sur les réseaux sociaux en échange d'une rémunération calculée au
          nombre de vues générées (CPM).
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>2. Fonctionnement des campagnes</h3>
        <p style={{ color: 'var(--muted)' }}>
          Une Marque crée une campagne en définissant un budget total et un tarif au CPM. Ce budget
          est déposé sur la plateforme avant que la campagne ne soit visible des Créateurs
          (mécanisme d'escrow). Une commission de service est prélevée par Fanka au moment du dépôt.
        </p>
        <p style={{ color: 'var(--muted)' }}>
          Les Créateurs rejoignent une campagne, publient du contenu conforme au brief fourni, et
          soumettent le lien de leur publication. Les gains sont calculés au prorata des vues
          réelles générées, dans la limite du budget disponible de la campagne.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>3. Modération et anti-fraude</h3>
        <p style={{ color: 'var(--muted)' }}>
          Chaque soumission est soumise à une review avant comptabilisation des gains. Fanka se
          réserve le droit de rejeter toute soumission ne respectant pas le brief, ou suspectée de
          fraude (vues achetées, contenu dupliqué, comptes multiples). Les gains restent verrouillés
          pendant un délai de sécurité avant de devenir disponibles au retrait, afin de permettre la
          détection d'éventuelles fraudes.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>4. Paiements et retraits</h3>
        <p style={{ color: 'var(--muted)' }}>
          Les dépôts et retraits s'effectuent via les moyens de paiement mobile disponibles sur la
          plateforme (Mobile Money, Wave). Un montant minimum de retrait peut être appliqué. Fanka
          n'est pas responsable des délais ou frais imposés par les opérateurs de paiement tiers.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>5. Litiges</h3>
        <p style={{ color: 'var(--muted)' }}>
          En cas de désaccord entre une Marque et un Créateur sur une soumission (contenu supprimé
          après paiement, qualité du contenu, soupçon de fraude), l'une ou l'autre partie peut
          ouvrir un litige. Fanka arbitre ce litige de bonne foi sur la base des éléments fournis ;
          sa décision est finale dans le cadre de l'usage de la plateforme.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>6. Responsabilités</h3>
        <p style={{ color: 'var(--muted)' }}>
          Fanka agit en tant qu'intermédiaire technique et n'est pas partie aux accords commerciaux
          entre Marques et Créateurs au-delà des termes explicitement définis dans chaque campagne.
          Chaque utilisateur reste responsable du contenu qu'il publie et de sa conformité aux lois
          en vigueur.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>7. Modification des CGU</h3>
        <p style={{ color: 'var(--muted)' }}>
          Fanka peut modifier ces conditions à tout moment. Les utilisateurs seront informés de tout
          changement substantiel via la plateforme.
        </p>
      </div>
    </div>
  );
}