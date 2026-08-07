import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Marketplace from './pages/Marketplace';
import MesCampagnes from './pages/MesCampagnes';
import DetailCampagne from './pages/DetailCampagne';
import TableauDeBordMarque from './pages/TableauDeBordMarque';
import CreerCampagne from './pages/CreerCampagne';
import TableauDeBord from './pages/TableauDeBord';
import Admin from './pages/Admin';
import CGU from './pages/CGU';
import Confidentialite from './pages/Confidentialite';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/confidentialite" element={<Confidentialite />} />

          <Route element={<Layout />}>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mes-campagnes" element={<MesCampagnes />} />
            <Route path="/mes-campagnes/:id" element={<DetailCampagne />} />
            <Route path="/tableau-de-bord-marque" element={<TableauDeBordMarque />} />
            <Route path="/creer-campagne" element={<CreerCampagne />} />
            <Route path="/tableau-de-bord" element={<TableauDeBord />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/marketplace" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}