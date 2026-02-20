import { Platform } from "react-native";
import { CatalogCardPage, MyCard, PlacePage, VisitCheckResponse } from "../types/gameTypes";

export const DEMO_LAT = 37.579617;
export const DEMO_LNG = 126.977041;
export const PAGE_SIZE = 20;
export const MAP_PAGE_LIMIT = 300;
export const CATALOG_PAGE_SIZE = 40;

export type MapViewportBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  level: number;
};

export function getApiBaseUrl() {
  const sharedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const platformBaseUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_BASE_URL_IOS;
  const base = sharedBaseUrl || platformBaseUrl;
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

export async function fetchMyCards(apiBaseUrl: string, userId: string) {
  return fetchJson<MyCard[]>(`${apiBaseUrl}/cards/my?userId=${encodeURIComponent(userId)}`);
}

export async function fetchCardCatalogPage(apiBaseUrl: string, page: number, userId: string, region?: string) {
  const params = new URLSearchParams({
    userId,
    page: String(page),
    pageSize: String(CATALOG_PAGE_SIZE),
  });
  if (region) {
    params.set("region", region);
  }
  return fetchJson<CatalogCardPage>(`${apiBaseUrl}/cards/catalog?${params.toString()}`);
}

export type CheckVisitRequest = {
  userId: string;
  lat: number;
  lng: number;
  radiusM?: number;
  excludePlaceIds?: string[];
};

export async function checkVisitWithUser(apiBaseUrl: string, payload: CheckVisitRequest) {
  return fetchJson<VisitCheckResponse>(`${apiBaseUrl}/visits/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
