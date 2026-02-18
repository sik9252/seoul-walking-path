import { Course, WalkRecord } from "../../domain/types";
import { initialCourses, records } from "../../mocks/walkingData";

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
  getCourses: () => Promise<Course[]>;
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

async function fetchCoursesFromApi(): Promise<Course[] | null> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const response = await fetch(`${normalizedBaseUrl}/routes`);
  if (!response.ok) {
    throw new Error(`failed_to_fetch_routes_${response.status}`);
  }

  const payload = (await response.json()) as ApiRoute[];
  if (!Array.isArray(payload)) return null;
  return payload.map(mapApiRouteToCourse);
}

export const walkingRepository: WalkingRepository = {
  async getCourses() {
    try {
      const apiCourses = await fetchCoursesFromApi();
      if (apiCourses && apiCourses.length > 0) {
        return apiCourses;
      }
    } catch (error) {
      console.warn("[walkingRepository] fallback to mock courses:", error);
    }
    return initialCourses;
  },
  async getRecords() {
    return records;
  },
};
