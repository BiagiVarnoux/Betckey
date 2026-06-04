import type { Product } from '@/lib/db/schema';

export default function SpecsTable({ product }: { product: Product }) {
  const specs = product.specs as { label: string; value: string }[] | null;
  if (!specs || specs.length === 0) return null;

  return (
    <div className="py-8 border-t border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Especificaciones técnicas</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {specs.map(({ label, value }) => (
              <tr key={label} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 pr-4 text-gray-500 font-medium w-1/3">{label}</td>
                <td className="py-2.5 text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
