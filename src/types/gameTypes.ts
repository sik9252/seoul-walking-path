export type GameTab = "explore" | "collection" | "my";

export type PlaceItem = {
  id: string;
  areaCode: string;
  region: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string | null;
};

export type PlacePage = {
  items: PlaceItem[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
};

export type MyCard = {
  cardId: string;
  title: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  place: PlaceItem | null;
};

export type CatalogCardItem = {
  cardId: string;
  placeId: string;
  title: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  imageUrl?: string | null;
  place: PlaceItem | null;
  collected: boolean;
};

export type CatalogCardPage = {
  items: CatalogCardItem[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
};

export type VisitCheckResponse = {
  matched?: boolean;
  collected?: boolean;
  place?: PlaceItem;
  card?: { title?: string; rarity?: "common" | "rare" | "epic" | "legendary"; imageUrl?: string | null };
  reason?: string;
  distanceM?: number;
  collectedAt?: string;
  remainingCollectableCount?: number;
};
