export const ALL_ACCESS_PRICE = 300;

export interface GamePriceItem {
  id: string;
  title: string;
  hypeTier?: string;
  price?: number;
}

export interface PricingCalculationResult {
  gameCount: number;
  individualSum: number;
  finalPrice: number;
  savings: number;
  planType: "ALL_ACCESS";
  planLabel: string;
  nudge?: string;
  isAllAccessBetterValue: boolean;
}

/**
 * Server-side single source of truth for pricing:
 * Flat ₹300 for Lifetime All-Access Guide & entire 265+ games catalog.
 */
export function calculatePlanPricing(
  games: GamePriceItem[] = [],
  _isExplicitAllAccess = true
): PricingCalculationResult {
  return {
    gameCount: games.length > 0 ? games.length : 245,
    individualSum: ALL_ACCESS_PRICE,
    finalPrice: ALL_ACCESS_PRICE,
    savings: 0,
    planType: "ALL_ACCESS",
    planLabel: "Complete Setup Guide & Lifetime Vault Access (265+ Titles)",
    isAllAccessBetterValue: false,
  };
}
