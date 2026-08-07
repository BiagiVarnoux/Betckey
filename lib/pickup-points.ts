export type PickupPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  schedule: string;
};

export const PICKUP_POINTS: PickupPoint[] = [
  {
    id: 'sc-centro',
    name: 'Punto Santa Cruz – Centro',
    address: 'Calle Arenales 248, Santa Cruz de la Sierra',
    city: 'Santa Cruz',
    schedule: 'Lun–Vie 9:00–18:00 · Sáb 9:00–13:00',
  },
  {
    id: 'sc-equipetrol',
    name: 'Punto Santa Cruz – Equipetrol',
    address: '3er Anillo Externo y Av. San Martín, Santa Cruz de la Sierra',
    city: 'Santa Cruz',
    schedule: 'Lun–Vie 9:00–18:00 · Sáb 9:00–13:00',
  },
  {
    id: 'lpz-miraflores',
    name: 'Punto La Paz – Miraflores',
    address: 'Av. Busch 1234, La Paz',
    city: 'La Paz',
    schedule: 'Lun–Vie 9:00–18:00',
  },
  {
    id: 'cbba-centro',
    name: 'Punto Cochabamba – Centro',
    address: 'Av. Ayacucho 456, Cochabamba',
    city: 'Cochabamba',
    schedule: 'Lun–Vie 9:00–18:00',
  },
];
