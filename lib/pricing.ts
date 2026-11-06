export interface GamePriceItem {
  id: string;
  title: string;
  hypeTier: string;
  price: number; // ourMonthlyPriceINR
}

export interface PricingCalculationResult {
  gameCount: number;
  individualSum: number;
  finalPrice: number;
  savings: number;
  planType: "SINGLE" | "BUNDLE_2" | "BUNDLE_3" | "MULTI_4_5" | "ALL_ACCESS";
  planLabel: string;
  nudge?: string;
  isAllAccessBetterValue: boolean;
}

/**
 * Server-side single source of truth for pricing
 */
export function calculatePlanPricing(
  games: GamePriceItem[],
  isExplicitAllAccess = false
): PricingCalculationResult {
  if (isExplicitAllAccess) {
    return {
      gameCount: 0,
      individualSum: 300,
      finalPrice: 300,
      savings: 0,
      planType: "ALL_ACCESS",
      planLabel: "All-Access Pass (240+ Games)",
      isAllAccessBetterValue: false,
    };
  }

  const n = games.length;
  if (n === 0) {
    return {
      gameCount: 0,
      individualSum: 0,
      finalPrice: 0,
      savings: 0,
      planType: "SINGLE",
      planLabel: "No Games Selected",
      isAllAccessBetterValue: false,
    };
  }

  const sum = games.reduce((acc, g) => acc + (g.price || 0), 0);

  let cap = Infinity;
  let planType: "SINGLE" | "BUNDLE_2" | "BUNDLE_3" | "MULTI_4_5" | "ALL_ACCESS" = "SINGLE";
  let planLabel = "Single Game";

  if (n === 1) {
    cap = sum;
    planType = "SINGLE";
    planLabel = "Single Game";
  } else if (n === 2) {
    cap = 149;
    planType = "BUNDLE_2";
    planLabel = "2-Game Bundle";
  } else if (n === 3) {
    cap = 199;
    planType = "BUNDLE_3";
    planLabel = "3-Game Bundle";
  } else {
    cap = 300;
    planType = "MULTI_4_5";
    planLabel = `${n}-Game Bundle`;
  }

  let finalPrice = Math.min(sum, cap);

  // If price hits 300 or user selects 6 or more games, automatically convert to ALL_ACCESS at 300
  if (finalPrice >= 300 || n >= 6) {
    finalPrice = 300;
    planType = "ALL_ACCESS";
    planLabel = "All-Access Pass (Automatic Upgrade)";
  }

  const savings = Math.max(0, sum - finalPrice);

  let nudge: string | undefined;
  if (n === 1) {
    nudge = "Add 1 more game for as low as ₹149 total with our 2-Game Bundle cap!";
  } else if (n === 2 && finalPrice < 199) {
    nudge = "Add a 3rd game! 3 games are capped at only ₹199 total.";
  } else if (n >= 3 && n < 6 && finalPrice < 300) {
    nudge = "Unlock every game in the catalog for just ₹300/mo with All-Access!";
  }

  const isAllAccessBetterValue = finalPrice >= 250 && planType !== "ALL_ACCESS";

  return {
    gameCount: n,
    individualSum: sum,
    finalPrice,
    savings,
    planType,
    planLabel,
    nudge,
    isAllAccessBetterValue,
  };
}

