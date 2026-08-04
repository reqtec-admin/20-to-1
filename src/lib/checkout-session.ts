import type Stripe from "stripe";
import { products } from "@/lib/products";
import {
  getProServiceFee,
  getUpgradeFee,
  type ProServiceOption,
  type UpgradeOption,
} from "@/lib/checkout-fees";

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
  upgrade: UpgradeOption;
  proService: ProServiceOption;
};

function upgradeLabel(upgrade: UpgradeOption): string {
  if (upgrade === "advanced") return "Advanced — Native Model";
  if (upgrade === "premium") return "Premium — On Premise";
  return "";
}

function proServiceLabel(pro: ProServiceOption): string {
  if (pro === "silver") return "Silver";
  if (pro === "gold") return "Gold";
  if (pro === "platinum") return "Platinum";
  return "";
}

export function validateCheckoutItems(items: CheckoutItemInput[]): CheckoutItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Unknown product: ${item.productId}`);
    }

    const quantity = Math.min(99, Math.max(1, Math.floor(item.quantity)));
    const upgrade: UpgradeOption =
      item.upgrade === "advanced" || item.upgrade === "premium" ? item.upgrade : null;
    const proService: ProServiceOption =
      item.proService === "silver" ||
      item.proService === "gold" ||
      item.proService === "platinum"
        ? item.proService
        : null;

    return { productId: product.id, quantity, upgrade, proService };
  });
}

export function buildStripeLineItems(
  items: CheckoutItemInput[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: `${product.category} agent subscription`,
        },
        unit_amount: Math.round(product.price * 100),
        recurring: { interval: "month" },
      },
      quantity: item.quantity,
    });

    const upgradeFee = getUpgradeFee(item.upgrade);
    if (upgradeFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} — ${upgradeLabel(item.upgrade)}`,
          },
          unit_amount: Math.round(upgradeFee * 100),
        },
        quantity: 1,
      });
    }

    const proFee = getProServiceFee(item.proService);
    if (proFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} — Pro ${proServiceLabel(item.proService)}`,
          },
          unit_amount: Math.round(proFee * 100),
        },
        quantity: 1,
      });
    }
  }

  return lineItems;
}
