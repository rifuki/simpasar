export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(0)} Juta`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function formatRupiahFull(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CATEGORY_LABELS: Record<string, string> = {
  fnb_beverage: "F&B - Minuman",
  fnb_food: "F&B - Makanan",
  fashion: "Fashion",
  beauty: "Kecantikan",
  electronics: "Elektronik",
  services: "Jasa",
  other: "Lainnya",
};
