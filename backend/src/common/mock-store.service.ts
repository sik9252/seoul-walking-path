import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable } from "@nestjs/common";
import { PlaceCard, PlaceItem, UserVisitItem } from "./models";

type TourPlaceSnapshot = {
  places: Array<{
    sourceId: string;
    areaCode?: string;
    region?: string;
    title: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    imageUrl?: string | null;
  }>;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function normalizePlaceCategory(raw: string): string {
  if (raw.startsWith("A01")) return "자연";
  if (raw.startsWith("A02")) return "문화";
  if (raw.startsWith("A03")) return "레저";
  return "일반";
}

function inferRegionFromAddress(address: string): string {
  const value = address.trim();
  if (!value) return "기타";
  if (value.startsWith("서울")) return "서울";
  if (value.startsWith("부산")) return "부산";
  if (value.startsWith("대구")) return "대구";
  if (value.startsWith("인천")) return "인천";
  if (value.startsWith("광주")) return "광주";
  if (value.startsWith("대전")) return "대전";
  if (value.startsWith("울산")) return "울산";
  if (value.startsWith("세종")) return "세종";
  if (value.startsWith("경기")) return "경기";
  if (value.startsWith("강원")) return "강원";
  if (value.startsWith("충북")) return "충북";
  if (value.startsWith("충남")) return "충남";
  if (value.startsWith("경북")) return "경북";
  if (value.startsWith("경남")) return "경남";
  if (value.startsWith("전북")) return "전북";
  if (value.startsWith("전남")) return "전남";
  if (value.startsWith("제주")) return "제주";
  return "기타";
}

function rarityByIndex(index: number): "common" | "rare" | "epic" {
  if (index % 17 === 0) return "epic";
  if (index % 5 === 0) return "rare";
  return "common";
}

@Injectable()
export class MockStoreService {
  private places: PlaceItem[] = [];
  private cards: PlaceCard[] = [];
  private userPlaceVisits: UserVisitItem[] = [];

  constructor() {
    this.bootstrapPlaceData();
  }

  private bootstrapPlaceData() {
    const backendRoot = path.resolve(__dirname, "../..");
    const placesPath = path.join(backendRoot, "data/generated/tour-places.normalized.json");
    if (!fs.existsSync(placesPath)) {
      this.places = [
        {
          id: "place-sample-1",
          sourceId: "sample-1",
          areaCode: "1",
          region: "서울",
          name: "경복궁",
          category: "문화",
          address: "서울 종로구 사직로 161",
          lat: 37.579617,
          lng: 126.977041,
        },
        {
          id: "place-sample-2",
          sourceId: "sample-2",
          areaCode: "1",
          region: "서울",
          name: "남산서울타워",
          category: "랜드마크",
          address: "서울 용산구 남산공원길 105",
          lat: 37.55117,
          lng: 126.988227,
        },
      ];
      this.cards = this.places.map((place, index) => ({
        cardId: `card-${place.id}`,
        placeId: place.id,
        title: `${place.name}`,
        rarity: rarityByIndex(index + 1),
      }));
      console.warn(`[mock-store] places file not found: ${placesPath}. fallback sample loaded.`);
      return;
    }

    try {
      const snapshot = JSON.parse(fs.readFileSync(placesPath, "utf8")) as TourPlaceSnapshot;
      const rows = Array.isArray(snapshot.places) ? snapshot.places : [];
      this.places = rows.map((row, index) => ({
        id: `place-${row.sourceId}`,
        sourceId: row.sourceId,
        areaCode: row.areaCode ?? "0",
        region: row.region ?? inferRegionFromAddress(row.address),
        name: row.title,
        category: normalizePlaceCategory(row.category),
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        imageUrl: row.imageUrl ?? null,
      }));
      this.cards = this.places.map((place, index) => ({
        cardId: `card-${place.id}`,
        placeId: place.id,
        title: `${place.name}`,
        rarity: rarityByIndex(index + 1),
        imageUrl: place.imageUrl ?? null,
      }));
      console.log(`[mock-store] loaded ${this.places.length} places from ${placesPath}`);
    } catch (error) {
      console.error("[mock-store] failed to load tour places, fallback sample", error);
    }
  }

  getPlaces(params: {
    lat?: number;
    lng?: number;
    radius?: number;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    limit?: number;
    page: number;
    pageSize: number;
  }) {
    const { lat, lng, radius, minLat, maxLat, minLng, maxLng, limit, page, pageSize } = params;
    let rows = this.places;

    if (minLat !== undefined && maxLat !== undefined && minLng !== undefined && maxLng !== undefined) {
      rows = rows.filter(
        (place) => place.lat >= minLat && place.lat <= maxLat && place.lng >= minLng && place.lng <= maxLng,
      );
    }

    if (lat !== undefined && lng !== undefined) {
      const applyRadius = radius ?? 5000;
      rows = rows.filter((place) => distanceInMeters(lat, lng, place.lat, place.lng) <= applyRadius);
    }

    if (limit !== undefined) {
      const safeLimit = Math.min(500, Math.max(1, Math.floor(limit)));
      const items = rows.slice(0, safeLimit);
      return {
        items,
        page: 1,
        pageSize: safeLimit,
        total: rows.length,
        hasNext: rows.length > safeLimit,
      };
    }

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const startIndex = (safePage - 1) * safePageSize;
    const items = rows.slice(startIndex, startIndex + safePageSize);
    const total = rows.length;

    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
      hasNext: startIndex + items.length < total,
    };
  }

  checkPlaceVisit(payload: { userId: string; lat: number; lng: number; radiusM: number }) {
    const { userId, lat, lng, radiusM } = payload;
    const candidate = this.places
      .map((place) => ({ place, distanceM: distanceInMeters(lat, lng, place.lat, place.lng) }))
      .filter((row) => row.distanceM <= radiusM)
      .sort((a, b) => a.distanceM - b.distanceM)[0];

    if (!candidate) {
      return {
        matched: false,
        collected: false,
      };
    }

    const existing = this.userPlaceVisits.find(
      (visit) => visit.userId === userId && visit.placeId === candidate.place.id,
    );
    if (existing) {
      return {
        matched: true,
        collected: false,
        reason: "already_collected",
        place: candidate.place,
        distanceM: Math.round(candidate.distanceM),
      };
    }

    const now = new Date().toISOString();
    this.userPlaceVisits.push({
      userId,
      placeId: candidate.place.id,
      firstVisitedAt: now,
      lat,
      lng,
    });
    const card = this.cards.find((item) => item.placeId === candidate.place.id) ?? null;

    return {
      matched: true,
      collected: true,
      place: candidate.place,
      card,
      distanceM: Math.round(candidate.distanceM),
      collectedAt: now,
    };
  }

  getCardCatalog(params?: { page?: number; pageSize?: number; userId?: string; region?: string }) {
    const safePage = Math.max(1, Math.floor(params?.page ?? 1));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(params?.pageSize ?? 20)));
    const userId = params?.userId ?? "demo-user";
    const region = params?.region?.trim();
    const acquiredPlaceIds = new Set(
      this.userPlaceVisits.filter((visit) => visit.userId === userId).map((visit) => visit.placeId),
    );

    let rows = this.cards.map((card) => {
      const place = this.places.find((item) => item.id === card.placeId) ?? null;
      return {
        ...card,
        place,
        collected: acquiredPlaceIds.has(card.placeId),
      };
    });

    if (region) {
      rows = rows.filter((row) => row.place?.region === region);
    }

    const startIndex = (safePage - 1) * safePageSize;
    const items = rows.slice(startIndex, startIndex + safePageSize);
    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total: rows.length,
      hasNext: startIndex + items.length < rows.length,
    };
  }

  getMyCards(userId: string) {
    const acquiredPlaceIds = new Set(
      this.userPlaceVisits.filter((visit) => visit.userId === userId).map((visit) => visit.placeId),
    );
    return this.cards
      .filter((card) => acquiredPlaceIds.has(card.placeId))
      .map((card) => ({
        ...card,
        place: this.places.find((place) => place.id === card.placeId) ?? null,
      }));
  }
}
