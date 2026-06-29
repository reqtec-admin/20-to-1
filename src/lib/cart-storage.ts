import type { CartItem } from "@/context/CartContext";

const CART_STORAGE_KEY = "20-to-1-cart";

export type StoredCartItem = {
  productId: string;
  quantity: number;
  upgrade: CartItem["upgrade"];
  proService: CartItem["proService"];
};

export function saveCartToSession(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload: StoredCartItem[] = items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    upgrade: item.upgrade,
    proService: item.proService,
  }));
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredCart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CART_STORAGE_KEY);
}
