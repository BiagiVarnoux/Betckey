interface Props {
  model: string;
  widthMm: number;
  heightMm: number;
  labelType: string;
  className?: string;
}

export default function ProductPlaceholder({ model, widthMm, heightMm, labelType, className = '' }: Props) {
  const isLandscape = labelType === 'continuous' || widthMm > heightMm;
  const ratio = labelType === 'continuous' ? 3 : heightMm > 0 ? heightMm / widthMm : 1.5;

  return (
    <div
      className={`relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${className}`}
      style={{ aspectRatio: isLandscape ? '4/3' : '3/4' }}
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label={`Etiqueta ${model}`}
      >
        <rect width="200" height="200" fill="#E5E7EB" />
        <rect x="20" y="20" width="160" height="160" rx="8" fill="white" stroke="#D1D5DB" strokeWidth="2" />
        {/* Barcode lines */}
        {[60,65,68,73,76,80,83,88,92,95,100,103,107,110,115,118,122,125,130,135,138].map((x, i) => (
          <rect key={i} x={x} y="100" width={i % 3 === 0 ? 3 : 1.5} height="35" fill="#374151" />
        ))}
        <text x="100" y="92" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1F2937" fontFamily="monospace">
          {model}
        </text>
        <text x="100" y="155" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="sans-serif">
          {widthMm}mm{heightMm > 0 ? ` × ${heightMm}mm` : ' continua'}
        </text>
        {/* Corner dots */}
        <circle cx="32" cy="32" r="4" fill="#E5E7EB" />
        <circle cx="168" cy="32" r="4" fill="#E5E7EB" />
        <circle cx="32" cy="168" r="4" fill="#E5E7EB" />
        <circle cx="168" cy="168" r="4" fill="#E5E7EB" />
      </svg>
    </div>
  );
}
