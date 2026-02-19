import { Platform } from "react-native";
import { PlacePage, MyCard, VisitCheckResponse } from "../types/gameTypes";

export const DEMO_USER_ID = "demo-user";
export const DEMO_LAT = 37.579617;
export const DEMO_LNG = 126.977041;
export const PAGE_SIZE = 20;
export const MAP_PAGE_LIMIT = 300;

export type MapViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  level: number;
};

export function getApiBaseUrl() {
  const platformBaseUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_BASE_URL_IOS;
  const base = platformBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;
  return base?.endsWith("/") ? base.slice(0, -1) : base;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`request_failed_${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchPlacesPage(apiBaseUrl: string, page: number) {
  return fetchJson<PlacePage>(`${apiBaseUrl}/places?page=${page}&pageSize=${PAGE_SIZE}`);
}

export async function fetchPlacesByViewport(
  apiBaseUrl: string,
  viewport: MapViewportBounds,
  limit = MAP_PAGE_LIMIT,
) {
  const params = new URLSearchParams({
    minLat: String(viewport.minLat),
    maxLat: String(viewport.maxLat),
    minLng: String(viewport.minLng),
    maxLng: String(viewport.maxLng),
    limit: String(limit),
  });
  const page = await fetchJson<PlacePage>(`${apiBaseUrl}/places?${params.toString()}`);
  return page.items;
}

export async function fetchMyCards(apiBaseUrl: string) {
  return fetchJson<MyCard[]>(`${apiBaseUrl}/cards/my?userId=${DEMO_USER_ID}`);
}

export async function checkVisit(apiBaseUrl: string) {
  return fetchJson<VisitCheckResponse>(`${apiBaseUrl}/visits/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      lat: DEMO_LAT,
      lng: DEMO_LNG,
      radiusM: 50,
    }),
  });
}
