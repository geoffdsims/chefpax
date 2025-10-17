/**
 * ChefPax Loyalty Points System
 * 1 point = $1 spent, 100 points = $10 discount
 */

export type LoyaltyTier = 'seed' | 'sprout' | 'harvest' | 'chef';

export interface LoyaltyAccount {
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  redeemedPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  userId: string;
  points: number;
  type: 'earned' | 'redeemed';
  orderId?: string;
  description: string;
  createdAt: string;
}

// Points earning rules
export const POINTS_RULES = {
  DOLLAR_SPENT: 1,           // 1 point per $1 spent
  SIGN_UP_BONUS: 100,        // 100 points ($10 value) on sign up
  REFERRAL_BONUS: 500,       // 500 points ($50 value) for referrals
  REVIEW_BONUS: 50,          // 50 points for product review
  SOCIAL_SHARE: 25,          // 25 points for social media share
};

// Redemption values
export const REDEMPTION = {
  MIN_POINTS: 100,           // Minimum 100 points to redeem
  POINTS_PER_DOLLAR: 10,     // 10 points = $1 discount
};

// Tier thresholds (based on lifetime points)
export const TIERS = {
  SEED: { min: 0, name: 'Seed', discount: 0 },
  SPROUT: { min: 500, name: 'Sprout', discount: 0 },
  HARVEST: { min: 2000, name: 'Harvest', discount: 5 },
  CHEF: { min: 5000, name: 'Chef', discount: 10 },
};

/**
 * Calculate points earned from order
 */
export function calculatePointsEarned(orderTotalCents: number): number {
  const dollars = orderTotalCents / 100;
  return Math.floor(dollars * POINTS_RULES.DOLLAR_SPENT);
}

/**
 * Calculate discount from points
 */
export function calculateDiscount(pointsToRedeem: number): number {
  if (pointsToRedeem < REDEMPTION.MIN_POINTS) return 0;
  return Math.floor(pointsToRedeem / REDEMPTION.POINTS_PER_DOLLAR) * 100; // Return in cents
}

/**
 * Get tier based on lifetime points
 */
export function getTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= TIERS.CHEF.min) return 'chef';
  if (lifetimePoints >= TIERS.HARVEST.min) return 'harvest';
  if (lifetimePoints >= TIERS.SPROUT.min) return 'sprout';
  return 'seed';
}

/**
 * Get tier details
 */
export function getTierDetails(tier: LoyaltyTier) {
  const details = {
    seed: TIERS.SEED,
    sprout: TIERS.SPROUT,
    harvest: TIERS.HARVEST,
    chef: TIERS.CHEF,
  };
  return details[tier];
}

