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

export type AuthUser = {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  createdAt: string;
};

export type AuthProviderLink = {
  id: string;
  userId: string;
  provider: "kakao";
  providerUserId: string;
  createdAt: string;
};

export type RefreshTokenSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
};
