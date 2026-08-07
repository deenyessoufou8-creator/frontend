import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatsBadge from './StatsBadge';
import Notifications from './Notifications';

export default function Layout() {
  const { utilisateur, deconnexion } = useAuth();
  const location = useLocation();

  if (!utilisateur) return <Navigate to="/connexion" replace />;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand"><span className="dot" />Fanka</div>
        <nav className="nav-links">
          {utilisateur.role === 'marque' && (
            <>
              <Link to="/tableau-de-bord-marque" className={isActive('/tableau-de-bord-marque') ? 'active' : ''}>Tableau de bord</Link>
              <Link to="/mes-campagnes" className={isActive('/mes-campagnes') ? 'active' : ''}>Mes campagnes</Link>
              <Link to="/creer-campagne" className={isActive('/creer-campagne') ? 'active' : ''}>Créer</Link>
            </>
          )}
          {utilisateur.role === 'createur' && (
            <>
              <Link to="/marketplace" className={isActive('/marketplace') ? 'active' : ''}>Marketplace</Link>
              <Link to="/tableau-de-bord" className={isActive('/tableau-de-bord') ? 'active' : ''}>Tableau de bord</Link>
            </>
          )}
          {utilisateur.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link>
          )}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatsBadge />
          <Notifications />
          <span className="wallet-chip">{utilisateur.nom}</span>
          <button className="btn btn-ghost" onClick={deconnexion}>Se déconnecter</button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}