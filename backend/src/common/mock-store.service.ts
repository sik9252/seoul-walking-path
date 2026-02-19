import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  AttemptCheckpointVisit,
  AttemptItem,
  AttemptStatus,
  CourseCheckpoint,
  PlaceCard,
  PlaceItem,
  Poi,
  PoiCategory,
  RouteItem,
  SessionItem,
  UserVisitItem,
} from "./models";

const CHECKPOINT_RADIUS_M = 40;

const DEFAULT_ROUTES: RouteItem[] = [
  {
    id: "c1",
    name: "남산 둘레길 (북측순환로)",
    district: "중구 예장동",
    distanceKm: 3.5,
    durationMin: 80,
    difficulty: "쉬움",
    rating: 4.8,
    reviewCount: 1240,
    description: "서울의 역사와 자연을 함께 느낄 수 있는 대표 산책로입니다.",
    pois: [
      { id: "c1-p1", routeId: "c1", title: "창의문", detail: "코스 시작점 · 화장실 있음", category: "landmark", mapQuery: "서울 창의문" },
      { id: "c1-p2", routeId: "c1", title: "백악마루", detail: "포토 스팟 · 1.2km 지점", category: "photo", mapQuery: "북악산 백악마루" },
      { id: "c1-p3", routeId: "c1", title: "말바위 안내소", detail: "휴식 공간 · 물 보충 가능", category: "rest", mapQuery: "말바위 안내소" },
    ],
  },
  {
    id: "c2",
    name: "서울숲 힐링 코스",
    district: "성동구 성수동",
    distanceKm: 4.2,
    durationMin: 100,
    difficulty: "보통",
    rating: 4.7,
    reviewCount: 892,
    description: "계절 식물과 열린 공원을 따라 걷는 평탄한 코스입니다.",
    pois: [
      { id: "c2-p1", routeId: "c2", title: "나비정원", detail: "초반 포인트 · 포토 스팟", category: "photo", mapQuery: "서울숲 나비정원" },
      { id: "c2-p2", routeId: "c2", title: "수변 산책로", detail: "중반 · 벤치 다수", category: "rest", mapQuery: "서울숲 수변 산책로" },
    ],
  },
];

const DEFAULT_CHECKPOINTS: CourseCheckpoint[] = [
  { id: "cp-c1-1", routeId: "c1", order: 1, name: "도봉산역", lat: 37.6894, lng: 127.0466 },
  { id: "cp-c1-2", routeId: "c1", order: 2, name: "서울창포원", lat: 37.6854, lng: 127.0452 },
  { id: "cp-c1-3", routeId: "c1", order: 3, name: "채석장 전망대", lat: 37.6801, lng: 127.0523 },
  { id: "cp-c1-4", routeId: "c1", order: 4, name: "당고개공원 갈림길", lat: 37.6678, lng: 127.0796 },
  { id: "cp-c2-1", routeId: "c2", order: 1, name: "당고개공원 갈림길", lat: 37.6678, lng: 127.0796 },
  { id: "cp-c2-2", routeId: "c2", order: 2, name: "복천암", lat: 37.6694, lng: 127.0848 },
  { id: "cp-c2-3", routeId: "c2", order: 3, name: "덕릉고개", lat: 37.6515, lng: 127.0913 },
  { id: "cp-c2-4", routeId: "c2", order: 4, name: "상계동 나들이 철쭉동산", lat: 37.6496, lng: 127.0828 },
];

type SeoulCourse = {
  roadNo: number;
  roadNm: string;
  roadExpln: string;
  roadDtlNm: string;
  reqHr: string;
  roadLenKm: number;
  lvKorn: string;
  bgngPstn: string;
  endPstn: string;
  stmpPstn1: string | null;
  stmpPstn2: string | null;
  stmpPstn3: string | null;
};

type SeoulCoursesSnapshot = {
  courses: SeoulCourse[];
};

type GeocodedCheckpoint = {
  courseId: string;
  checkpointOrder: number;
  canonicalName: string;
  lat: number | null;
  lng: number | null;
};

type GeocodedCheckpointSnapshot = {
  checkpoints: GeocodedCheckpoint[];
};

type TourPlaceSnapshot = {
  places: Array<{
    sourceId: string;
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

function parseDurationMinutes(text: string): number {
  const hourMatch = text.match(/(\d+)\s*시간/);
  const minuteMatch = text.match(/(\d+)\s*분/);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const total = hours * 60 + minutes;
  return total > 0 ? total : 60;
}

function mapDifficulty(value: string): "쉬움" | "보통" | "어려움" {
  if (value.includes("상")) return "어려움";
  if (value.includes("중")) return "보통";
  return "쉬움";
}

function parseDetailNames(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split(",")
    .map((name) => name.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim())
    .filter((name) => name.length > 0)
    .filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
}

function buildPois(routeId: string, course: SeoulCourse): Poi[] {
  const categories: PoiCategory[] = ["landmark", "photo", "rest"];
  const candidates = [
    course.stmpPstn1,
    course.stmpPstn2,
    course.stmpPstn3,
    ...parseDetailNames(course.roadDtlNm),
  ].filter((item): item is string => !!item && item.trim().length > 0);
  const deduped = [...new Set(candidates)].slice(0, 4);

  return deduped.map((name, index) => ({
    id: `${routeId}-poi-${index + 1}`,
    routeId,
    title: name,
    detail: "서울둘레길 주요 포인트",
    category: categories[index % categories.length],
    mapQuery: `서울 ${name}`,
  }));
}

function normalizePlaceCategory(raw: string): string {
  if (raw.startsWith("A01")) return "자연";
  if (raw.startsWith("A02")) return "문화";
  if (raw.startsWith("A03")) return "레저";
  return "일반";
}

function rarityByIndex(index: number): "common" | "rare" | "epic" {
  if (index % 17 === 0) return "epic";
  if (index % 5 === 0) return "rare";
  return "common";
}

@Injectable()
export class MockStoreService {
  private routes: RouteItem[] = DEFAULT_ROUTES;
  private checkpoints: CourseCheckpoint[] = DEFAULT_CHECKPOINTS;
  private sessions: SessionItem[] = [];
  private attempts: AttemptItem[] = [];
  private visits: AttemptCheckpointVisit[] = [];
  private favoriteRouteIds = new Set<string>();
  private places: PlaceItem[] = [];
  private cards: PlaceCard[] = [];
  private userPlaceVisits: UserVisitItem[] = [];

  constructor() {
    this.bootstrapRouteData();
    this.bootstrapPlaceData();
  }

  private bootstrapRouteData() {
    const backendRoot = process.cwd();
    const coursesPath = path.join(backendRoot, "data/generated/seoul-courses.normalized.json");
    const checkpointsPath = path.join(backendRoot, "data/generated/course-checkpoints.geocoded.json");

    if (!fs.existsSync(coursesPath)) return;

    try {
      const coursesSnapshot = JSON.parse(fs.readFileSync(coursesPath, "utf8")) as SeoulCoursesSnapshot;
      const courses = Array.isArray(coursesSnapshot.courses) ? coursesSnapshot.courses : [];
      if (courses.length === 0) return;

      const nextRoutes: RouteItem[] = courses.map((course) => {
        const routeId = `road-${course.roadNo}`;
        return {
          id: routeId,
          name: `${course.roadNo}코스 ${course.roadNm}`,
          district: `${course.bgngPstn} → ${course.endPstn}`,
          distanceKm: course.roadLenKm || 0,
          durationMin: parseDurationMinutes(course.reqHr ?? ""),
          difficulty: mapDifficulty(course.lvKorn ?? ""),
          rating: 4.7,
          reviewCount: 0,
          description: course.roadExpln || `${course.roadNm} 코스`,
          pois: buildPois(routeId, course),
        };
      });

      this.routes = nextRoutes;

      if (fs.existsSync(checkpointsPath)) {
        const geocodedSnapshot = JSON.parse(fs.readFileSync(checkpointsPath, "utf8")) as GeocodedCheckpointSnapshot;
        const cps = Array.isArray(geocodedSnapshot.checkpoints) ? geocodedSnapshot.checkpoints : [];
        const resolved = cps
          .filter((cp) => Number.isFinite(cp.lat) && Number.isFinite(cp.lng))
          .map((cp) => ({
            id: `cp-${cp.courseId}-${cp.checkpointOrder}`,
            routeId: cp.courseId,
            order: cp.checkpointOrder,
            name: cp.canonicalName,
            lat: cp.lat as number,
            lng: cp.lng as number,
          }));
        if (resolved.length > 0) {
          this.checkpoints = resolved;
        }
      }
    } catch (error) {
      console.error("[mock-store] failed to load generated course files, fallback to default mock", error);
    }
  }

  private bootstrapPlaceData() {
    const backendRoot = process.cwd();
    const placesPath = path.join(backendRoot, "data/generated/tour-places.normalized.json");
    if (!fs.existsSync(placesPath)) {
      this.places = [
        {
          id: "place-sample-1",
          sourceId: "sample-1",
          name: "경복궁",
          category: "문화",
          address: "서울 종로구 사직로 161",
          lat: 37.579617,
          lng: 126.977041,
        },
        {
          id: "place-sample-2",
          sourceId: "sample-2",
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
        title: `${place.name} 카드`,
        rarity: rarityByIndex(index + 1),
      }));
      return;
    }

    try {
      const snapshot = JSON.parse(fs.readFileSync(placesPath, "utf8")) as TourPlaceSnapshot;
      const rows = Array.isArray(snapshot.places) ? snapshot.places : [];
      this.places = rows.map((row, index) => ({
        id: `place-${row.sourceId}`,
        sourceId: row.sourceId,
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
        title: `${place.name} 카드`,
        rarity: rarityByIndex(index + 1),
        imageUrl: place.imageUrl ?? null,
      }));
    } catch (error) {
      console.error("[mock-store] failed to load tour places, fallback sample", error);
    }
  }

  private toProgress(attempt: AttemptItem) {
    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      routeId: attempt.routeId,
      status: attempt.status,
      visitedCount: attempt.visitedCheckpointIds.length,
      totalCount: attempt.totalCount,
      completionRate: attempt.totalCount > 0 ? attempt.visitedCheckpointIds.length / attempt.totalCount : 0,
      visitedCheckpointIds: attempt.visitedCheckpointIds,
    };
  }

  getRoutesPage(page = 1, pageSize = 20) {
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const routes = this.getRoutes();
    const total = routes.length;
    const startIndex = (safePage - 1) * safePageSize;
    const items = routes.slice(startIndex, startIndex + safePageSize);
    const hasNext = startIndex + items.length < total;

    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
      hasNext,
    };
  }

  getRoutes() {
    return this.routes.map((route) => ({
      ...route,
      isFavorite: this.favoriteRouteIds.has(route.id),
    }));
  }

  getRouteById(routeId: string) {
    const route = this.getRoutes().find((item) => item.id === routeId);
    if (!route) throw new NotFoundException("route_not_found");
    return route;
  }

  getRouteCheckpoints(routeId: string) {
    if (!this.routes.some((route) => route.id === routeId)) {
      throw new NotFoundException("route_not_found");
    }
    return this.checkpoints.filter((cp) => cp.routeId === routeId).sort((a, b) => a.order - b.order);
  }

  createAttempt(userId: string, routeId: string) {
    const cps = this.getRouteCheckpoints(routeId);
    const attempt: AttemptItem = {
      id: `a-${Date.now()}`,
      userId,
      routeId,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      totalCount: cps.length,
      visitedCheckpointIds: [],
    };
    this.attempts = [attempt, ...this.attempts];
    return this.toProgress(attempt);
  }

  getAttemptProgress(attemptId: string) {
    const attempt = this.attempts.find((item) => item.id === attemptId);
    if (!attempt) throw new NotFoundException("attempt_not_found");
    return this.toProgress(attempt);
  }

  submitAttemptLocation(attemptId: string, lat: number, lng: number, recordedAt: string) {
    const attempt = this.attempts.find((item) => item.id === attemptId);
    if (!attempt) throw new NotFoundException("attempt_not_found");

    if (attempt.status !== "in_progress") {
      return { newlyVisitedCheckpointIds: [], progress: this.toProgress(attempt) };
    }

    const checkpoints = this.getRouteCheckpoints(attempt.routeId);
    const visitedSet = new Set(attempt.visitedCheckpointIds);
    const newlyVisitedCheckpointIds: string[] = [];

    for (const cp of checkpoints) {
      if (visitedSet.has(cp.id)) continue;
      const distanceM = distanceInMeters(lat, lng, cp.lat, cp.lng);
      if (distanceM <= CHECKPOINT_RADIUS_M) {
        visitedSet.add(cp.id);
        newlyVisitedCheckpointIds.push(cp.id);
        this.visits.push({
          id: `v-${Date.now()}-${cp.id}`,
          attemptId,
          checkpointId: cp.id,
          visitedAt: recordedAt,
          distanceM,
          lat,
          lng,
        });
      }
    }

    attempt.visitedCheckpointIds = [...visitedSet];
    if (attempt.visitedCheckpointIds.length >= attempt.totalCount && attempt.totalCount > 0) {
      attempt.status = "completed";
      attempt.completedAt = new Date().toISOString();
    }

    return { newlyVisitedCheckpointIds, progress: this.toProgress(attempt) };
  }

  completeAttempt(attemptId: string) {
    const attempt = this.attempts.find((item) => item.id === attemptId);
    if (!attempt) throw new NotFoundException("attempt_not_found");

    if (attempt.status === "in_progress") {
      const isCompleted = attempt.visitedCheckpointIds.length >= attempt.totalCount && attempt.totalCount > 0;
      attempt.status = isCompleted ? "completed" : ("abandoned" as AttemptStatus);
      if (attempt.status === "completed") {
        attempt.completedAt = new Date().toISOString();
      }
    }

    return this.toProgress(attempt);
  }

  getPois(routeId?: string, category?: PoiCategory) {
    const allPois = this.routes.flatMap((route) => route.pois);
    return allPois.filter((poi) => {
      if (routeId && poi.routeId !== routeId) return false;
      if (category && poi.category !== category) return false;
      return true;
    });
  }

  getSessions() {
    return [...this.sessions].sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1));
  }

  createSession(payload: Omit<SessionItem, "id">) {
    const session: SessionItem = {
      id: `s-${Date.now()}`,
      ...payload,
    };
    this.sessions = [session, ...this.sessions];
    return session;
  }

  toggleFavorite(routeId: string) {
    if (!this.routes.some((item) => item.id === routeId)) {
      throw new NotFoundException("route_not_found");
    }
    if (this.favoriteRouteIds.has(routeId)) {
      this.favoriteRouteIds.delete(routeId);
      return { routeId, isFavorite: false };
    }
    this.favoriteRouteIds.add(routeId);
    return { routeId, isFavorite: true };
  }

  getFavorites() {
    return this.getRoutes().filter((route) => this.favoriteRouteIds.has(route.id));
  }

  getPlaces(params: { lat?: number; lng?: number; radius?: number; page: number; pageSize: number }) {
    const { lat, lng, radius, page, pageSize } = params;
    let rows = this.places;

    if (lat !== undefined && lng !== undefined) {
      const applyRadius = radius ?? 5000;
      rows = rows.filter((place) => distanceInMeters(lat, lng, place.lat, place.lng) <= applyRadius);
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

    const existing = this.userPlaceVisits.find((visit) => visit.userId === userId && visit.placeId === candidate.place.id);
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

  getCardCatalog(page = 1, pageSize = 20) {
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const startIndex = (safePage - 1) * safePageSize;
    const items = this.cards.slice(startIndex, startIndex + safePageSize);
    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total: this.cards.length,
      hasNext: startIndex + items.length < this.cards.length,
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
