import { Injectable, NotFoundException } from "@nestjs/common";
import { PoiCategory, RouteItem, SessionItem } from "./models";

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
        { id: "c1-p1", routeId: "c1", title: "창의문", detail: "코스 시작점 · 화장실 있음", category: "landmark", mapQuery: "서울 창의문" },
        { id: "c1-p2", routeId: "c1", title: "백악마루", detail: "포토 스팟 · 1.2km 지점", category: "photo", mapQuery: "북악산 백악마루" },
        { id: "c1-p3", routeId: "c1", title: "말바위 안내소", detail: "휴식 공간 · 물 보충 가능", category: "rest", mapQuery: "말바위 안내소" }
      ]
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
        { id: "c2-p2", routeId: "c2", title: "수변 산책로", detail: "중반 · 벤치 다수", category: "rest", mapQuery: "서울숲 수변 산책로" }
      ]
    }
  ];

  private sessions: SessionItem[] = [];
  private favoriteRouteIds = new Set<string>();

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
