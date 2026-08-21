export default function BandeauDemo() {
  return (
    <div
      style={{
        background: 'rgba(255,177,0,0.1)',
        border: '1px solid rgba(255,177,0,0.35)',
        borderRadius: 12,
        padding: '10px 16px',
        marginBottom: 20,
        fontSize: 12.5,
        color: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 15 }}>🧪</span>
      <span>
        <strong style={{ color: 'var(--gold)' }}>Mode démo</strong> — les paiements Mobile Money et le comptage des vues sont actuellement simulés, en attendant l'intégration d'un partenaire de paiement agréé.
      </span>
    </div>
  );
}