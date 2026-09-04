import { storeConfig } from "@/config/store";
import { formatPrice } from "@/libs/currency";
import type { CartLine } from "@/libs/types";

export function buildOrderMessage(lines: CartLine[], total: number, note?: string): string {
  const items = lines
    .map(
      (line) =>
        `${line.quantity} × ${line.product.product_name} — ${formatPrice(
          line.product.price * line.quantity,
        )}`,
    )
    .join("\n");

  return [
    "Hello, I would like to place an order:",
    "",
    items,
    "",
    `Items total: ${formatPrice(total)}`,
    note && note.trim() ? `\nNote: ${note.trim()}` : "",
    "",
    "Please confirm availability and delivery fee.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = storeConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
