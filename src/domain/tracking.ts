export type TrackingStatus = "idle" | "running" | "paused" | "finished";

export type TrackingMetrics = {
  elapsedSec: number;
  distanceMeters: number;
  steps: number;
  kcal: number;
  status: TrackingStatus;
};

export function filterDistanceIncrementMeters(rawMeters: number, maxDeltaMeters = 8): number {
  if (Number.isNaN(rawMeters)) return 0;
  if (rawMeters < 0) return 0;
  if (rawMeters > maxDeltaMeters) return maxDeltaMeters;
  return rawMeters;
}

export function calculateMetrics(distanceMeters: number, elapsedSec: number): Pick<TrackingMetrics, "steps" | "kcal"> {
  const steps = Math.max(0, Math.round(distanceMeters * 1.4));
  const kcal = Math.max(0, Math.round((distanceMeters / 1000) * 55));
  return { steps, kcal };
}
