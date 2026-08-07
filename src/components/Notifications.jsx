import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Notifications() {
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  async function charger() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setNonLues(data.non_lues);
    } catch (err) {
      // silencieux : les notifications ne doivent jamais bloquer le reste de l'app
    }
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 30000);
    return () => clearInterval(intervalle);
  }, []);

  useEffect(() => {
    function fermerSiExterieur(e) {
      if (ref.current && !ref.current.contains(e.target)) setOuvert(false);
    }
    document.addEventListener('mousedown', fermerSiExterieur);
    return () => document.removeEventListener('mousedown', fermerSiExterieur);
  }, []);

  async function onClicNotification(n) {
    if (!n.lue) {
      try { await api.patch(`/notifications/${n.id}/lue`); } catch (err) {}
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, lue: true } : x)));
      setNonLues((c) => Math.max(c - 1, 0));
    }
    setOuvert(false);
    if (n.lien) navigate(n.lien);
  }

  async function toutMarquerLu() {
    try { await api.patch('/notifications/lues-toutes'); } catch (err) {}
    setNotifications((list) => list.map((x) => ({ ...x, lue: true })));
    setNonLues(0);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOuvert((o) => !o)}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 100, width: 38, height: 38, position: 'relative', cursor: 'pointer', color: 'var(--cream)', fontSize: 16 }}
      >
        🔔
        {nonLues > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: 'var(--coral)', color: 'white',
            fontSize: 10, fontWeight: 700, borderRadius: 100, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
          }}>
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div style={{
          position: 'absolute', right: 0, top: 46, width: 320, maxHeight: 400, overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 10, zIndex: 50,
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 10px' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
            {nonLues > 0 && (
              <button onClick={toutMarquerLu} style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: 11.5, cursor: 'pointer' }}>
                Tout marquer lu
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 12.5, padding: '10px 6px' }}>Aucune notification pour le moment.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onClicNotification(n)}
              style={{
                padding: '10px 8px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                background: n.lue ? 'transparent' : 'rgba(255,177,0,0.08)',
                fontSize: 12.5, lineHeight: 1.4,
              }}
            >
              <div style={{ color: n.lue ? 'var(--muted)' : 'var(--cream)' }}>{n.message}</div>
              <div style={{ color: 'var(--muted)', fontSize: 10.5, marginTop: 3 }}>
                {new Date(n.cree_le).toLocaleString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}