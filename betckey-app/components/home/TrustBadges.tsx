const badges = [
  { icon: '🛡️', title: '100% Compatible', desc: 'Con toda la serie Brother QL' },
  { icon: '📦', title: 'Venta por unidad', desc: 'Sin mínimo de compra' },
  { icon: '✈️', title: 'Envío a Bolivia', desc: 'Coordinamos el despacho' },
  { icon: '💬', title: 'Atención WhatsApp', desc: 'Respondemos a la brevedad' },
];

export default function TrustBadges() {
  return (
    <section id="trust" className="bg-[var(--color-surface)] py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((b) => (
          <div key={b.title} className="flex flex-col items-center text-center gap-2">
            <span className="text-3xl">{b.icon}</span>
            <p className="font-semibold text-gray-900">{b.title}</p>
            <p className="text-sm text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
