import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from './schema';
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 Seeding products...');

  await db.insert(products).values([
    {
      slug: 'dk-1201',
      name: 'Etiquetas de Dirección Brother DK-1201 Compatibles 1.1" x 3.5"',
      model: 'DK-1201',
      labelType: 'die-cut',
      mainUse: 'Etiquetas de dirección, códigos de barra, FNSKU, envíos, nombre/cargo',
      widthMm: 29,
      heightMm: 90,
      widthIn: '1.1"',
      heightIn: '3.5"',
      unitsPerRoll: 400,
      priceUsd: '6.99',
      priceBob: null,
      compatibleWith: ['QL-500','QL-550','QL-570','QL-580N','QL-650TD','QL-700','QL-710W','QL-720NW','QL-800','QL-810N','QL-820NWB','QL-1050','QL-1060N','QL-1100','QL-1110NWB'],
      features: [
        'Adhesivo fuerte (aguanta de -10°C a 70°C)',
        'Impresión nítida sin manchas',
        'Fácil de despegar',
        'Cartuchos reutilizables pre-instalados',
      ],
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: 'dk-1202',
      name: 'Etiquetas de Envío Brother DK-1202 Compatibles 2.4" x 3.9"',
      model: 'DK-1202',
      labelType: 'die-cut',
      mainUse: 'Etiquetas de envío, paquetes, correspondencia, inventario',
      widthMm: 62,
      heightMm: 100,
      widthIn: '2.4"',
      heightIn: '3.9"',
      unitsPerRoll: 300,
      priceUsd: '7.99',
      priceBob: null,
      compatibleWith: ['QL-500','QL-550','QL-570','QL-580N','QL-650TD','QL-700','QL-710W','QL-720NW','QL-800','QL-810W','QL-820NWB','QL-1050','QL-1060N','QL-1100','QL-1110NWB'],
      features: [
        'Papel recubierto duradero',
        'Texto nítido profesional',
        'Adhesivo permanente',
        'Cartuchos reutilizables pre-instalados',
      ],
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      slug: 'dk-1241',
      name: 'Etiquetas de Envío Brother DK-1241 Compatibles 4" x 6"',
      model: 'DK-1241',
      labelType: 'die-cut',
      mainUse: 'Etiquetas de envío grandes, paquetes de e-commerce, postales',
      widthMm: 102,
      heightMm: 152,
      widthIn: '4"',
      heightIn: '6"',
      unitsPerRoll: 200,
      priceUsd: '12.99',
      priceBob: null,
      compatibleWith: ['QL-1050','QL-1050N','QL-1050NWB','QL-1060N','QL-1100','QL-1110NWB'],
      features: [
        'Tamaño ideal para e-commerce',
        'Dirección visible de lejos',
        'Sin atascos de papel',
        'Cartuchos reutilizables pre-instalados',
      ],
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      slug: 'dk-2205',
      name: 'Etiquetas Continuas Brother DK-2205 Compatibles 2.4" x 100\'',
      model: 'DK-2205',
      labelType: 'continuous',
      mainUse: 'Etiquetas de longitud personalizable, tickets, recibos, inventario',
      widthMm: 62,
      heightMm: 0,
      widthIn: '2.4"',
      heightIn: '100\'',
      unitsPerRoll: 300,
      priceUsd: '8.99',
      priceBob: null,
      compatibleWith: ['QL-500','QL-550','QL-570','QL-580N','QL-650TD','QL-700','QL-710W','QL-720NW','QL-800','QL-810W','QL-820NWB','QL-1050','QL-1060N','QL-1100','QL-1110NWB'],
      features: [
        'Longitud personalizable — imprime lo que necesitas y corta',
        'Ideal para etiquetas variables',
        'Rollo continuo de 30.48m',
        'Cartuchos reutilizables pre-instalados',
      ],
      isActive: true,
      isFeatured: true,
      sortOrder: 4,
    },
  ]);

  console.log('✅ Seed completado — 4 productos insertados');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
