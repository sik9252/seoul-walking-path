export type PoiCategory = "landmark" | "photo" | "rest";

export type Poi = {
  id: string;
  routeId: string;
  title: string;
  detail: string;
  category: PoiCategory;
  mapQuery: string;
};

export type RouteItem = {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  durationMin: number;
  difficulty: "쉬움" | "보통" | "어려움";
  rating: number;
  reviewCount: number;
  description: string;
  pois: Poi[];
};

export type SessionItem = {
  id: string;
  routeId: string;
  title: string;
  startedAt: string;
  durationSec: number;
  distanceMeters: number;
  kcal: number;
};
