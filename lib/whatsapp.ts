export function buildWhatsAppURL({
  product,
  model,
  quantity,
}: {
  product: string;
  model: string;
  quantity: number;
}): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP;
  const message = `Hola, me interesa comprar:\nProducto: ${product}\nModelo: ${model}\nCantidad: ${quantity} rollo${quantity > 1 ? 's' : ''}\n¿Podrían darme más información y coordinar el envío?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppDirectURL(): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP;
  return `https://wa.me/${number}`;
}
