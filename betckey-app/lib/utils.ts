export function formatBob(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return 'Consultar precio';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `Bs. ${num.toFixed(2)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
