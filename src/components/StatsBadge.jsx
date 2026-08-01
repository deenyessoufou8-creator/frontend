import { useEffect, useState } from 'react';
import api from '../api/client';

export default function StatsBadge({ style }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/stats/public');
        setStats(data);
      } catch (err) {
        // Discret : si ça échoue, on n'affiche simplement rien.
      }
    })();
  }, []);

  if (!stats) return null;

  return (
    <div
      style={{
        display: 'flex', gap: 10, fontSize: 11.5, color: 'var(--muted)',
        fontFamily: 'var(--font-mono)', flexWrap: 'wrap', ...style,
      }}
    >
      <span><span className="gold" style={{ fontWeight: 600 }}>+{stats.nombre_createurs}</span> créateurs</span>
      <span>·</span>
      <span><span className="gold" style={{ fontWeight: 600 }}>+{stats.nombre_marques}</span> marques</span>
    </div>
  );
}
