import { Course, WalkRecord } from "../../domain/types";
import { initialCourses, records } from "../../mocks/walkingData";
import { Platform } from "react-native";

type ApiPoi = {
  id: string;
  title: string;
  detail: string;
  category: "landmark" | "photo" | "rest";
  mapQuery: string;
};

type ApiRoute = {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  durationMin: number;
  difficulty: "쉬움" | "보통" | "어려움";
  rating: number;
  reviewCount: number;
  description: string;
  pois: ApiPoi[];
  isFavorite?: boolean;
};

export type WalkingRepository = {
  getCoursesPage: (page: number, pageSize: number) => Promise<{
    items: Course[];
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
  }>;
  getRecords: () => Promise<WalkRecord[]>;
};

function mapApiRouteToCourse(route: ApiRoute): Course {
  return {
    id: route.id,
    name: route.name,
    subtitle: `${route.distanceKm.toFixed(1)}km · 약 ${route.durationMin}분`,
    district: route.district,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    difficulty: route.difficulty,
    rating: route.rating,
    reviewCount: route.reviewCount,
    tags: ["서울둘레길", route.difficulty],
    isFavorite: route.isFavorite ?? false,
    description: route.description,
    points: route.pois.map((poi) => ({
      id: poi.id,
      title: poi.title,
      detail: poi.detail,
      category: poi.category,
      mapQuery: poi.mapQuery,
    })),
  };
}

async function fetchCoursesFromApi(page: number, pageSize: number): Promise<{
  items: Course[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
} | null> {
  const platformBaseUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_BASE_URL_IOS;
  const baseUrl = platformBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const response = await fetch(`${normalizedBaseUrl}/routes?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error(`failed_to_fetch_routes_${response.status}`);
  }

  const payload = (await response.json()) as {
    items?: ApiRoute[];
    page?: number;
    pageSize?: number;
    total?: number;
    hasNext?: boolean;
  };
  if (!Array.isArray(payload.items)) return null;
  return {
    items: payload.items.map(mapApiRouteToCourse),
    page: payload.page ?? page,
    pageSize: payload.pageSize ?? pageSize,
    total: payload.total ?? payload.items.length,
    hasNext: payload.hasNext ?? false,
  };
}

export const walkingRepository: WalkingRepository = {
  async getCoursesPage(page, pageSize) {
    try {
      const apiPage = await fetchCoursesFromApi(page, pageSize);
      if (apiPage) {
        return apiPage;
      }
    } catch (error) {
      console.warn("[walkingRepository] fallback to mock courses:", error);
    }
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.max(1, Math.floor(pageSize));
    const startIndex = (safePage - 1) * safePageSize;
    const items = initialCourses.slice(startIndex, startIndex + safePageSize);
    return {
      items,
      page: safePage,
      pageSize: safePageSize,
      total: initialCourses.length,
      hasNext: startIndex + items.length < initialCourses.length,
    };
  },
  async getRecords() {
    return records;
  },
};
