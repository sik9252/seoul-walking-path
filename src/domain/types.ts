export type POICategory = "landmark" | "photo" | "rest";

export type POI = {
  id: string;
  title: string;
  detail: string;
  category: POICategory;
  mapQuery: string;
};

export type Course = {
  id: string;
  name: string;
  subtitle: string;
  district: string;
  distanceKm: number;
  durationMin: number;
  difficulty: "쉬움" | "보통" | "어려움";
  rating: number;
  reviewCount: number;
  tags: string[];
  isFavorite: boolean;
  description: string;
  points: POI[];
};

export type WalkRecord = {
  id: string;
  courseId: string;
  title: string;
  startedAt: string;
  distanceKm: number;
  durationText: string;
  paceText: string;
};

export type MainTab = "home" | "routes" | "records" | "my";
export type RouteFlow = "courseList" | "courseDetail" | "preStartCheck" | "tracking" | "walkSummary" | "reportIssue";
export type RecordFlow = "recordList" | "recordDetail";
export type IntroFlow = "splash" | "onboarding" | "permission" | "main";
