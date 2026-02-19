import React from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import type { RefreshLocationResult } from "../hooks/useUserLocation";
import { gameStyles as styles } from "../styles/gameStyles";
import { PlaceItem } from "../types/gameTypes";
import {
  buildKakaoMapHtml,
  ExploreFloatingControls,
  ExploreLocationErrorModal,
  ExploreMapView,
  ExplorePlaceListSheet,
  ExplorePlacePreviewCard,
  ExploreVisitResultModal,
} from "./widgets/explore";

let hasShownInitialLocationError = false;

type Props = {
  places: PlaceItem[];
  loading: boolean;
  hasNext: boolean;
  apiEnabled: boolean;
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
};

export function ExploreScreen({
  places,
  loading,
  hasNext,
  apiEnabled,
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
}: Props) {
  const mapWebViewRef = React.useRef<WebView>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [focusedPlace, setFocusedPlace] = React.useState<PlaceItem | null>(null);
  const [isLocationErrorOpen, setIsLocationErrorOpen] = React.useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = React.useState("현재 위치를 가져오지 못했습니다.");
  const [mapPlaces, setMapPlaces] = React.useState<PlaceItem[]>([]);

  React.useEffect(() => {
    if (mapPlaces.length === 0 && places.length > 0) {
      setMapPlaces(places.slice(0, 200));
    }
  }, [mapPlaces.length, places]);

  const markerPlaces = mapPlaces;
  const mapCenter = {
    latitude: userLocation?.latitude ?? 37.5665,
    longitude: userLocation?.longitude ?? 126.978,
  };
  const kakaoJavascriptKey = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  const mapHtml = React.useMemo(() => {
    if (!kakaoJavascriptKey) return "";
    return buildKakaoMapHtml({
      kakaoJavascriptKey,
      markerPlaces,
      userLocation,
      mapCenter,
    });
  }, [kakaoJavascriptKey, mapCenter, markerPlaces, userLocation]);

  const handleMapMessage = React.useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as { type?: string; placeId?: string };
        if (payload.type !== "markerPress" || !payload.placeId) return;
        const selected = markerPlaces.find((place) => place.id === payload.placeId);
        if (selected) setFocusedPlace(selected);
      } catch (error) {
        console.warn("[kakao-map] invalid postMessage payload", error);
      }
    },
    [markerPlaces],
  );

  React.useEffect(() => {
    if (locationError && !hasShownInitialLocationError) {
      hasShownInitialLocationError = true;
      setLocationErrorMessage(locationError);
      setIsLocationErrorOpen(true);
    }
  }, [locationError]);

  const handleRefreshLocation = React.useCallback(async () => {
    const result = await onRefreshLocation();
    if (!result.ok) {
      setLocationErrorMessage(result.reason);
      setIsLocationErrorOpen(true);
    }
  }, [onRefreshLocation]);

  const handleZoomIn = React.useCallback(() => {
    mapWebViewRef.current?.injectJavaScript("window.__zoomMap && window.__zoomMap(-1); true;");
  }, []);

  const handleZoomOut = React.useCallback(() => {
    mapWebViewRef.current?.injectJavaScript("window.__zoomMap && window.__zoomMap(1); true;");
  }, []);

  return (
    <View style={styles.mapScreen}>
      <View style={styles.mapBody}>
        <ExploreMapView
          mapRef={mapWebViewRef}
          kakaoJavascriptKey={kakaoJavascriptKey}
          mapHtml={mapHtml}
          onMessage={handleMapMessage}
        />

        <ExploreFloatingControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRefreshLocation={() => void handleRefreshLocation()}
          onOpenList={() => setIsSheetOpen(true)}
          onCheckVisit={onCheckVisit}
        />

        <ExplorePlacePreviewCard
          place={focusedPlace}
          onClose={() => setFocusedPlace(null)}
          onOpenDetail={onOpenDetail}
        />

        {!apiEnabled ? <Text style={styles.errorText}>API URL이 설정되지 않았습니다.</Text> : null}
        {isError ? <Text style={styles.errorText}>관광지 목록을 불러오지 못했습니다.</Text> : null}
      </View>

      <ExploreLocationErrorModal
        visible={isLocationErrorOpen}
        message={locationErrorMessage}
        onClose={() => setIsLocationErrorOpen(false)}
      />

      <ExplorePlaceListSheet
        visible={isSheetOpen}
        places={places}
        loading={loading}
        hasNext={hasNext}
        onLoadMore={onLoadMore}
        onClose={() => setIsSheetOpen(false)}
        onCheckVisit={onCheckVisit}
        onOpenDetail={onOpenDetail}
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
