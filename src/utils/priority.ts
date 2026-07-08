// src/utils/priority.ts

export interface PriorityMetricsInput {
  severity: number;             // S(x): 1-10 priority value determined by Gemini
  estimated_affected: number;   // D(x): Target community footprint count
  cost_estimate: number;        // C(x): Projected algorithmic asset repair spend
  geo_confidence: number;       // G(x): Validation coordinate accuracy score (0.0 - 1.0)
  created_at: string;           // Creation date ISO marker for tracking resource decay over time
}

/**
 * PRIORITY SCORE ENGINE - Formula from Section 5:
 * Priority(x) = (0.35 × S(x)) + (0.30 × Impact(x)) + (0.20 × G(x)) + (0.15 × T(x))
 */
export function calculatePriorityScore(input: PriorityMetricsInput): number {
  const S_x = input.severity;
  
  // Impact mapping calculations: Affected citizens divided by fiscal footprint
  const protectedCost = Math.max(input.cost_estimate, 1);
  const rawImpact = input.estimated_affected / protectedCost;
  const Impact_x = rawImpact * 1000; // Normalizing multiplier constant
  
  const G_x = input.geo_confidence * 10;
  
  // Time decay handling using a base-10 logarithmic curve
  const originTime = new Date(input.created_at).getTime();
  const loopTime = new Date().getTime();
  const totalDaysOpen = Math.floor((loopTime - originTime) / (1000 * 60 * 60 * 24));
  const T_x = Math.min(Math.log10(totalDaysOpen + 1) / 2.0, 1.0) * 10;

  // Aggregate weighted components
  const scoreRaw = (0.35 * S_x) + (0.30 * Impact_x) + (0.20 * G_x) + (0.15 * T_x);
  
  // Enforce structural limits to anchor values within the 0 to 100 boundary range
  return Math.round(Math.min((scoreRaw / 4.0) * 10, 100) * 10) / 10;
}

/**
 * Alternative signature from Day 3 Guide
 */
export function calculatePriority(complaint: any, wardData?: any): number {
  // S(x): Severity (from Gemini)
  const severity = complaint.severity || 5;
  
  // D(x)/C(x): Impact = population / cost
  const population = wardData?.population || complaint.estimated_affected || 100;
  const cost = complaint.cost_estimate || 45000;
  const impact = population / Math.max(cost, 1);
  
  // G(x): Geographic confidence (0-1)
  const geoConfidence = complaint.geo_confidence || 0.5;
  
  // T(x): Time decay (older = higher)
  const daysOpen = complaint.days_open || 0;
  const timeDecay = Math.min(Math.log10(daysOpen + 1) / 2.0, 1.0);
  
  // Calculate raw score
  const raw = (0.35 * severity) + (0.30 * impact * 1000) + (0.20 * geoConfidence * 10) + (0.15 * timeDecay * 10);
  
  // Normalize to 0-100
  return Math.round(Math.min((raw / 4.0) * 10, 100) * 10) / 10;
}

// Get priority color for UI
export function getPriorityColor(score: number): string {
  if (score >= 70) return 'bg-red-100 border-red-500 text-red-700';
  if (score >= 40) return 'bg-orange-100 border-orange-500 text-orange-700';
  return 'bg-green-100 border-green-500 text-green-700';
}

// Get priority label
export function getPriorityLabel(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}