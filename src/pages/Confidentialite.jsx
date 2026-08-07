import { Link } from 'react-router-dom';

export default function Confidentialite() {
  return (
    <div className="app-shell" style={{ maxWidth: 720, padding: '40px 20px' }}>
      <Link to="/connexion" style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'none' }}>← Retour</Link>
      <h1 className="page-title" style={{ marginTop: 16 }}>Politique de confidentialité</h1>
      <p className="subtitle">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>1. Données collectées</h3>
        <p style={{ color: 'var(--muted)' }}>
          Fanka collecte les données suivantes lors de l'inscription et de l'utilisation du
          service : nom, numéro de téléphone, email (optionnel), mot de passe (stocké sous forme
          hachée, jamais en clair), ainsi que les informations liées aux campagnes, soumissions et
          transactions effectuées sur la plateforme.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>2. Utilisation des données</h3>
        <p style={{ color: 'var(--muted)' }}>
          Ces données sont utilisées exclusivement pour : le fonctionnement du service (création de
          compte, gestion des campagnes et paiements), la sécurité (prévention de la fraude,
          résolution de litiges), et la communication liée à l'activité du compte (notifications
          de statut de soumission, par exemple).
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>3. Partage des données</h3>
        <p style={{ color: 'var(--muted)' }}>
          Les données ne sont partagées avec des tiers que dans la mesure nécessaire au
          fonctionnement du service : prestataires de paiement Mobile Money pour le traitement des
          transactions. Fanka ne vend ni ne loue les données personnelles à des fins publicitaires.
        </p>
        <p style={{ color: 'var(--muted)' }}>
          Le nom d'un Créateur et ses statistiques de performance (vues, taux d'approbation) sont
          visibles par les Marques dont il rejoint les campagnes, dans un but de transparence et de
          confiance mutuelle. Aucune coordonnée (téléphone, email) n'est partagée dans ce cadre.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>4. Sécurité</h3>
        <p style={{ color: 'var(--muted)' }}>
          Les mots de passe sont hachés avant stockage (personne, y compris l'équipe Fanka, ne peut
          les consulter en clair). Les connexions à l'API sont authentifiées par jeton. Les
          opérations financières sont effectuées de façon transactionnelle pour éviter toute
          incohérence de solde.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>5. Conservation des données</h3>
        <p style={{ color: 'var(--muted)' }}>
          Les données sont conservées tant que le compte reste actif. Un utilisateur peut demander
          la suppression de son compte et de ses données associées, sous réserve des obligations
          légales de conservation de certaines données transactionnelles.
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 28 }}>6. Vos droits</h3>
        <p style={{ color: 'var(--muted)' }}>
          Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos
          données personnelles en contactant l'équipe Fanka.
        </p>
      </div>
    </div>
  );
}