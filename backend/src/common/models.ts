export type PlaceItem = {
  id: string;
  sourceId: string;
  areaCode: string;
  region: string;
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
