interface Props {
  compatibleWith: string[];
  model: string;
}

export default function CompatiblePrinters({ compatibleWith, model }: Props) {
  const isQL1241 = model === 'DK-1241';

  return (
    <div className="py-8 border-t border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Impresoras compatibles</h2>

      {isQL1241 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <span className="mt-0.5">⚠️</span>
          <span>Solo compatible con la serie <strong>QL-1000</strong>. NO compatible con QL-500 ni QL-700.</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {compatibleWith.map((printer) => (
          <span
            key={printer}
            className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full font-mono"
          >
            {printer}
          </span>
        ))}
      </div>
    </div>
  );
}
