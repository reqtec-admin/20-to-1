import type { CartItem } from "@/context/CartContext";
import type { UpgradeOption } from "@/lib/checkout-fees";

const CART_STORAGE_KEY = "20-to-1-cart";

export type StoredCartItem = {
  productId: string;
  slug: string;
  quantity: number;
  upgrade: CartItem["upgrade"];
  proService: CartItem["proService"];
};

export function planFromUpgrade(
  upgrade: UpgradeOption
): "standard" | "advanced" | "premium" {
  if (upgrade === "advanced") return "advanced";
  if (upgrade === "premium") return "premium";
  return "standard";
}

export function saveCartToSession(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload: StoredCartItem[] = items.map((item) => ({
    productId: item.product.id,
    slug: item.product.slug,
    quantity: item.quantity,
    upgrade: item.upgrade,
    proService: item.proService,
  }));
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

export function loadCartFromSession(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearStoredCart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CART_STORAGE_KEY);
}
