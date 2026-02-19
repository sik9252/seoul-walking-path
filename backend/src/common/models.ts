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

export type CourseCheckpoint = {
  id: string;
  routeId: string;
  order: number;
  name: string;
  lat: number;
  lng: number;
};

export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export type AttemptItem = {
  id: string;
  userId: string;
  routeId: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  totalCount: number;
  visitedCheckpointIds: string[];
};

export type AttemptCheckpointVisit = {
  id: string;
  attemptId: string;
  checkpointId: string;
  visitedAt: string;
  distanceM: number;
  lat: number;
  lng: number;
};

export type PlaceItem = {
  id: string;
  sourceId: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string | null;
};

export type PlaceCard = {
  cardId: string;
  placeId: string;
  title: string;
  rarity: "common" | "rare" | "epic";
  imageUrl?: string | null;
};

export type UserVisitItem = {
  userId: string;
  placeId: string;
  firstVisitedAt: string;
  lat: number;
  lng: number;
};
