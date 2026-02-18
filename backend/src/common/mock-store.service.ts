import { Injectable, NotFoundException } from "@nestjs/common";
import {
  AttemptCheckpointVisit,
  AttemptItem,
  AttemptStatus,
  CourseCheckpoint,
  PoiCategory,
  RouteItem,
  SessionItem,
} from "./models";

const CHECKPOINT_RADIUS_M = 40;

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

@Injectable()
export class MockStoreService {
  private readonly routes: RouteItem[] = [
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
        {
          id: "c1-p1",
          routeId: "c1",
          title: "창의문",
          detail: "코스 시작점 · 화장실 있음",
          category: "landmark",
          mapQuery: "서울 창의문",
        },
        {
          id: "c1-p2",
          routeId: "c1",
          title: "백악마루",
          detail: "포토 스팟 · 1.2km 지점",
          category: "photo",
          mapQuery: "북악산 백악마루",
        },
        {
          id: "c1-p3",
          routeId: "c1",
          title: "말바위 안내소",
          detail: "휴식 공간 · 물 보충 가능",
          category: "rest",
          mapQuery: "말바위 안내소",
        },
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
        {
          id: "c2-p1",
          routeId: "c2",
          title: "나비정원",
          detail: "초반 포인트 · 포토 스팟",
          category: "photo",
          mapQuery: "서울숲 나비정원",
        },
        {
          id: "c2-p2",
          routeId: "c2",
          title: "수변 산책로",
          detail: "중반 · 벤치 다수",
          category: "rest",
          mapQuery: "서울숲 수변 산책로",
        },
      ],
    },
  ];

  private readonly checkpoints: CourseCheckpoint[] = [
    { id: "cp-c1-1", routeId: "c1", order: 1, name: "도봉산역", lat: 37.6894, lng: 127.0466 },
    { id: "cp-c1-2", routeId: "c1", order: 2, name: "서울창포원", lat: 37.6854, lng: 127.0452 },
    { id: "cp-c1-3", routeId: "c1", order: 3, name: "채석장 전망대", lat: 37.6801, lng: 127.0523 },
    { id: "cp-c1-4", routeId: "c1", order: 4, name: "당고개공원 갈림길", lat: 37.6678, lng: 127.0796 },

    { id: "cp-c2-1", routeId: "c2", order: 1, name: "당고개공원 갈림길", lat: 37.6678, lng: 127.0796 },
    { id: "cp-c2-2", routeId: "c2", order: 2, name: "복천암", lat: 37.6694, lng: 127.0848 },
    { id: "cp-c2-3", routeId: "c2", order: 3, name: "덕릉고개", lat: 37.6515, lng: 127.0913 },
    { id: "cp-c2-4", routeId: "c2", order: 4, name: "상계동 나들이 철쭉동산", lat: 37.6496, lng: 127.0828 },
  ];

  private sessions: SessionItem[] = [];
  private attempts: AttemptItem[] = [];
  private visits: AttemptCheckpointVisit[] = [];
  private favoriteRouteIds = new Set<string>();

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
}
