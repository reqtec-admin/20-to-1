export type UpgradeOption = "advanced" | "premium" | null;
export type ProServiceOption = "silver" | "gold" | "platinum" | null;

export const ADVANCED_ONE_TIME_FEE = 899;
export const PREMIUM_ONE_TIME_FEE = 799;
export const PRO_SILVER_FEE = 159;
export const PRO_GOLD_FEE = 299;
export const PRO_PLATINUM_FEE = 399;

export function getUpgradeFee(upgrade: UpgradeOption): number {
  if (upgrade === "advanced") return ADVANCED_ONE_TIME_FEE;
  if (upgrade === "premium") return PREMIUM_ONE_TIME_FEE;
  return 0;
}

export function getProServiceFee(pro: ProServiceOption): number {
  if (pro === "silver") return PRO_SILVER_FEE;
  if (pro === "gold") return PRO_GOLD_FEE;
  if (pro === "platinum") return PRO_PLATINUM_FEE;
  return 0;
}
