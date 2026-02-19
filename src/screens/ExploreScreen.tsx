import React from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { fetchPlacesByViewport, MAP_PAGE_LIMIT, type MapViewportBounds } from "../apis/gameApi";
import type { RefreshLocationResult } from "../hooks/useUserLocation";
import { gameStyles as styles } from "../styles/gameStyles";
import { PlaceItem } from "../types/gameTypes";
import {
  buildKakaoMapHtml,
  ExploreFloatingControls,
  ExploreLocationErrorModal,
  ExplorePlaceDetailSheet,
  ExplorePlaceListSheet,
  ExploreMapView,
  ExploreVisitResultModal,
} from "./widgets/explore";

let hasShownInitialLocationError = false;

type Props = {
  places: PlaceItem[];
  loading: boolean;
  hasNext: boolean;
  apiBaseUrl?: string;
  isError: boolean;
  userLocation: { latitude: number; longitude: number; heading?: number | null } | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  onRefreshLocation: () => Promise<RefreshLocationResult>;
  onCheckVisit: () => void;
  visitDialogVisible: boolean;
  visitDialogTitle: string;
  visitDialogMessage: string;
  onCloseVisitDialog: () => void;
  onOpenDetail: (place: PlaceItem) => void;
  onLoadMore: () => void;
  bottomOverlayOffset?: number;
  onDetailExpandedChange?: (expanded: boolean) => void;
  collectedPlaceIds: string[];
  mapFocusRequest?: {
    id: number;
    latitude: number;
    longitude: number;
  } | null;
};

export function ExploreScreen({
  places,
  loading,
  hasNext,
  apiBaseUrl,
  isError,
  userLocation,
  locationError,
  onRefreshLocation,
  onCheckVisit,
  visitDialogVisible,
  visitDialogTitle,
  visitDialogMessage,
  onCloseVisitDialog,
  onOpenDetail,
  onLoadMore,
  bottomOverlayOffset = 0,
  onDetailExpandedChange,
  collectedPlaceIds,
  mapFocusRequest,
}: Props) {
  const mapWebViewRef = React.useRef<WebView>(null);
  const viewportDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportCacheRef = React.useRef<Map<string, PlaceItem[]>>(new Map());
  const lastViewportKeyRef = React.useRef<string | null>(null);
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [focusedPlace, setFocusedPlace] = React.useState<PlaceItem | null>(null);
  const [isLocationErrorOpen, setIsLocationErrorOpen] = React.useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = React.useState("현재 위치를 가져오지 못했습니다.");
  const [mapPlaces, setMapPlaces] = React.useState<PlaceItem[]>([]);
  const [isViewportLoading, setIsViewportLoading] = React.useState(false);
  const [sheetPlaces, setSheetPlaces] = React.useState<PlaceItem[]>([]);
  const userLocationRef = React.useRef(userLocation);

  React.useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  const markerPlaces = mapPlaces;
  const collectedPlaceIdSet = React.useMemo(() => new Set(collectedPlaceIds), [collectedPlaceIds]);
  const mapCenter = {
    latitude: userLocation?.latitude ?? 37.5665,
    longitude: userLocation?.longitude ?? 126.978,
  };
  const initialCenterRef = React.useRef(mapCenter);
  const kakaoJavascriptKey = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  const mapHtml = React.useMemo(() => {
    if (!kakaoJavascriptKey) return "";
    return buildKakaoMapHtml({
      kakaoJavascriptKey,
      initialCenter: initialCenterRef.current,
    });
  }, [kakaoJavascriptKey]);

  const fetchViewportPlaces = React.useCallback(
    async (viewport: MapViewportBounds) => {
      if (!apiBaseUrl) return;
      const key = [
        viewport.minLat.toFixed(4),
        viewport.minLng.toFixed(4),
        viewport.maxLat.toFixed(4),
        viewport.maxLng.toFixed(4),
        viewport.level,
      ].join("|");

      if (lastViewportKeyRef.current === key) return;
      lastViewportKeyRef.current = key;

      if (viewportCacheRef.current.has(key)) {
        const cached = viewportCacheRef.current.get(key) ?? [];
        setMapPlaces(cached);
        return;
      }

      try {
        setIsViewportLoading(true);
        const items = await fetchPlacesByViewport(apiBaseUrl, viewport, MAP_PAGE_LIMIT);
        viewportCacheRef.current.set(key, items);
        setMapPlaces(items);
      } catch (error) {
        console.warn("[explore] failed to fetch viewport places", error);
      } finally {
        setIsViewportLoading(false);
      }
    },
    [apiBaseUrl],
  );

  const handleMapMessage = React.useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          placeId?: string;
          coordKey?: string;
          viewport?: MapViewportBounds;
        };

        if (payload.type === "markerPress" && payload.placeId) {
          const selected = markerPlaces.find((place) => place.id === payload.placeId);
          if (selected) {
            setIsSheetOpen(false);
            setFocusedPlace(selected);
          }
          return;
        }
        if (payload.type === "overlapPress" && payload.coordKey) {
          const grouped = markerPlaces.filter(
            (place) => `${place.lat.toFixed(6)}|${place.lng.toFixed(6)}` === payload.coordKey,
          );
          setFocusedPlace(null);
          setSheetPlaces(grouped);
          setIsSheetOpen(true);
          return;
        }

        if (
          payload.type === "viewportChanged" &&
          payload.viewport &&
          Number.isFinite(payload.viewport.minLat) &&
          Number.isFinite(payload.viewport.maxLat) &&
          Number.isFinite(payload.viewport.minLng) &&
          Number.isFinite(payload.viewport.maxLng) &&
          Number.isFinite(payload.viewport.level)
        ) {
          if (viewportDebounceRef.current) {
            clearTimeout(viewportDebounceRef.current);
          }

          viewportDebounceRef.current = setTimeout(() => {
            void fetchViewportPlaces(payload.viewport as MapViewportBounds);
          }, 300);
        }
      } catch (error) {
        console.warn("[kakao-map] invalid postMessage payload", error);
      }
    },
    [fetchViewportPlaces, markerPlaces],
  );

  React.useEffect(
    () => () => {
      if (viewportDebounceRef.current) {
        clearTimeout(viewportDebounceRef.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (locationError && !hasShownInitialLocationError) {
      hasShownInitialLocationError = true;
      setLocationErrorMessage(locationError);
      setIsLocationErrorOpen(true);
    }
  }, [locationError]);

  const handleRefreshLocation = React.useCallback(async () => {
    const knownLocation = userLocationRef.current;
    if (knownLocation) {
      mapWebViewRef.current?.injectJavaScript(
        `window.__moveTo && window.__moveTo(${knownLocation.latitude}, ${knownLocation.longitude}); true;`,
      );
    }

    const result = await onRefreshLocation();
    if (!result.ok) {
      setLocationErrorMessage(result.reason);
      setIsLocationErrorOpen(true);
      return;
    }

    const latestLocation = userLocationRef.current ?? knownLocation;
    if (latestLocation) {
      mapWebViewRef.current?.injectJavaScript(
        `window.__moveTo && window.__moveTo(${latestLocation.latitude}, ${latestLocation.longitude}); true;`,
      );
    }
  }, [onRefreshLocation]);

  const handleZoomIn = React.useCallback(() => {
    if (!isMapReady) return;
    mapWebViewRef.current?.injectJavaScript("window.__zoomMap && window.__zoomMap(-1); true;");
  }, [isMapReady]);

  const handleZoomOut = React.useCallback(() => {
    if (!isMapReady) return;
    mapWebViewRef.current?.injectJavaScript("window.__zoomMap && window.__zoomMap(1); true;");
  }, [isMapReady]);

  React.useEffect(() => {
    if (!isMapReady || !mapWebViewRef.current) return;
    const placesPayload = JSON.stringify(
      markerPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        imageUrl: place.imageUrl ?? null,
        collected: collectedPlaceIdSet.has(place.id),
      })),
    );
    mapWebViewRef.current.injectJavaScript(`window.__setPlaces && window.__setPlaces(${placesPayload}); true;`);
  }, [collectedPlaceIdSet, isMapReady, markerPlaces]);

  React.useEffect(() => {
    if (!isMapReady || !mapWebViewRef.current) return;
    const locationPayload = JSON.stringify(userLocation ?? null);
    mapWebViewRef.current.injectJavaScript(
      `window.__setUserLocation && window.__setUserLocation(${locationPayload}); true;`,
    );
  }, [isMapReady, userLocation]);

  React.useEffect(() => {
    if (!isMapReady || !mapWebViewRef.current || !mapFocusRequest) return;
    mapWebViewRef.current.injectJavaScript(
      `window.__moveTo && window.__moveTo(${mapFocusRequest.latitude}, ${mapFocusRequest.longitude}); true;`,
    );
  }, [isMapReady, mapFocusRequest]);

  return (
    <View style={styles.mapScreen}>
      <View style={styles.mapBody}>
        <ExploreMapView
          mapRef={mapWebViewRef}
          kakaoJavascriptKey={kakaoJavascriptKey}
          mapHtml={mapHtml}
          onMessage={handleMapMessage}
          onLoadEnd={() => setIsMapReady(true)}
        />

        <ExploreFloatingControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRefreshLocation={() => void handleRefreshLocation()}
          onOpenList={() => {
            setFocusedPlace(null);
            setSheetPlaces(markerPlaces);
            setIsSheetOpen(true);
          }}
          onCheckVisit={onCheckVisit}
          isPlaceDetailActive={Boolean(focusedPlace)}
        />

        {!apiBaseUrl ? <Text style={styles.errorText}>API URL이 설정되지 않았습니다.</Text> : null}
        {isError ? <Text style={styles.errorText}>관광지 목록을 불러오지 못했습니다.</Text> : null}
      </View>

      <ExploreLocationErrorModal
        visible={isLocationErrorOpen}
        message={locationErrorMessage}
        onClose={() => setIsLocationErrorOpen(false)}
      />

      <ExplorePlaceListSheet
        visible={isSheetOpen}
        places={sheetPlaces}
        collectedPlaceIds={collectedPlaceIds}
        loading={isViewportLoading}
        hasNext={false}
        onLoadMore={() => {}}
        onClose={() => setIsSheetOpen(false)}
        onOpenDetail={(place) => {
          onOpenDetail(place);
          setFocusedPlace(place);
        }}
        bottomOffset={bottomOverlayOffset}
      />

      <ExplorePlaceDetailSheet
        place={focusedPlace}
        isCollected={focusedPlace ? collectedPlaceIdSet.has(focusedPlace.id) : false}
        onClose={() => setFocusedPlace(null)}
        bottomOffset={bottomOverlayOffset}
        onExpandedChange={onDetailExpandedChange}
      />

      <ExploreVisitResultModal
        visible={visitDialogVisible}
        title={visitDialogTitle}
        message={visitDialogMessage}
        onClose={onCloseVisitDialog}
      />
    </View>
  );
}
