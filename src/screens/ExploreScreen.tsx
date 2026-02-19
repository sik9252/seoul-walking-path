import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { Button, Card } from "../components/ui";
import { colors } from "../theme/tokens";
import { gameStyles as styles } from "../styles/gameStyles";
import { PlaceItem } from "../types/gameTypes";

type Props = {
  places: PlaceItem[];
  loading: boolean;
  hasNext: boolean;
  apiEnabled: boolean;
  isError: boolean;
  userLocation: { latitude: number; longitude: number; heading?: number | null } | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  onRefreshLocation: () => void;
  onCheckVisit: () => void;
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
  isLoadingLocation,
  locationError,
  onRefreshLocation,
  onCheckVisit,
  onOpenDetail,
  onLoadMore,
}: Props) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [focusedPlace, setFocusedPlace] = React.useState<PlaceItem | null>(null);
  const markerPlaces = places.slice(0, 200);
  const mapCenter = {
    latitude: userLocation?.latitude ?? 37.5665,
    longitude: userLocation?.longitude ?? 126.978,
  };
  const kakaoJavascriptKey = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  const mapHtml = React.useMemo(() => {
    if (!kakaoJavascriptKey) return "";

    const placesJson = JSON.stringify(
      markerPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        imageUrl: place.imageUrl ?? null,
      })),
    );
    const userLocationJson = JSON.stringify(userLocation);
    const centerJson = JSON.stringify(mapCenter);

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f6f7f4; }
      .spot-marker {
        width: 34px;
        height: 34px;
        border-radius: 17px;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        background: #e8efe3;
        padding: 0;
      }
      .spot-marker img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .user-marker {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        background: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(0, 0, 0, 0.22);
        position: relative;
      }
      .user-heading {
        position: absolute;
        top: -15px;
        left: 50%;
        width: 0;
        height: 0;
        margin-left: -6px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 11px solid #1d4ed8;
        transform-origin: 50% 21px;
      }
      .user-heading.idle {
        opacity: 0.8;
      }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavascriptKey}&autoload=false"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (function () {
        const places = ${placesJson};
        const userLocation = ${userLocationJson};
        const center = ${centerJson};

        function postMessage(payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function init() {
          const mapContainer = document.getElementById("map");
          const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(center.latitude, center.longitude),
            level: 7,
          });

          if (userLocation && userLocation.latitude && userLocation.longitude) {
            const heading = typeof userLocation.heading === "number" ? userLocation.heading : null;

            const userMarker = document.createElement("div");
            userMarker.className = "user-marker";

            const headingArrow = document.createElement("div");
            headingArrow.className = heading === null ? "user-heading idle" : "user-heading";
            headingArrow.style.transform = "rotate(" + (heading === null ? 0 : heading) + "deg)";
            userMarker.appendChild(headingArrow);

            const userOverlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
              content: userMarker,
              yAnchor: 0.5,
              zIndex: 6,
            });
            userOverlay.setMap(map);
          }

          places.forEach(function (place) {
            const position = new kakao.maps.LatLng(place.lat, place.lng);

            if (place.imageUrl) {
              const button = document.createElement("button");
              button.className = "spot-marker";
              button.type = "button";
              button.ariaLabel = place.name;

              const image = document.createElement("img");
              image.src = place.imageUrl;
              image.alt = place.name;
              image.onerror = function () {
                button.style.background = "#dce5d5";
                button.innerHTML = "";
              };
              button.appendChild(image);

              button.addEventListener("click", function () {
                postMessage({ type: "markerPress", placeId: place.id });
              });

              const overlay = new kakao.maps.CustomOverlay({
                position,
                content: button,
                yAnchor: 1,
                zIndex: 3,
              });
              overlay.setMap(map);
              return;
            }

            const marker = new kakao.maps.Marker({ map, position });
            kakao.maps.event.addListener(marker, "click", function () {
              postMessage({ type: "markerPress", placeId: place.id });
            });
          });
        }

        kakao.maps.load(init);
      })();
    </script>
  </body>
</html>`;
  }, [kakaoJavascriptKey, markerPlaces, mapCenter, userLocation]);

  const handleMapMessage = React.useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as { type?: string; placeId?: string };
        if (payload.type !== "markerPress" || !payload.placeId) return;
        const selected = markerPlaces.find((place) => place.id === payload.placeId);
        if (selected) {
          setFocusedPlace(selected);
        }
      } catch (error) {
        console.warn("[kakao-map] invalid postMessage payload", error);
      }
    },
    [markerPlaces],
  );

  const previewPlace = focusedPlace ?? markerPlaces[0] ?? null;

  return (
    <View style={styles.mapScreen}>
      <View style={styles.mapBody}>
        {kakaoJavascriptKey ? (
          <WebView
            style={styles.mapFull}
            source={{ html: mapHtml }}
            onMessage={handleMapMessage}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.errorText}>EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY가 필요합니다.</Text>
          </View>
        )}

        <View style={styles.floatingRightControls}>
          <Pressable style={styles.floatingCircleButton} onPress={onRefreshLocation}>
            <Ionicons name="locate" size={20} color={colors.brand[700]} />
          </Pressable>
          <Pressable style={styles.floatingCircleButton} onPress={() => setIsSheetOpen(true)}>
            <Ionicons name="list" size={20} color={colors.base.text} />
          </Pressable>
          <Pressable style={styles.floatingCircleButton} onPress={onCheckVisit}>
            <Ionicons name="sparkles" size={20} color={colors.base.text} />
          </Pressable>
        </View>

        <View style={styles.mapMetaRow}>
          <Text style={styles.cardBody}>지도 핀: {markerPlaces.length}개</Text>
          <Text style={styles.moreText}>{isLoadingLocation ? "위치 확인중..." : "내 위치 준비됨"}</Text>
        </View>

        {previewPlace ? (
          <View style={styles.floatingPlaceCard}>
            <View style={styles.floatingPlaceTop}>
              {previewPlace.imageUrl ? (
                <Image source={{ uri: previewPlace.imageUrl }} style={styles.floatingPlaceImage} />
              ) : (
                <View style={styles.floatingPlaceImageFallback}>
                  <Ionicons name="image-outline" size={20} color={colors.base.textSubtle} />
                </View>
              )}
              <View style={styles.floatingPlaceTextWrap}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {previewPlace.name}
                </Text>
                <Text style={styles.cardBody} numberOfLines={1}>
                  {previewPlace.category} · {previewPlace.address}
                </Text>
              </View>
              <Pressable onPress={() => setFocusedPlace(null)}>
                <Ionicons name="close" size={18} color={colors.base.textSubtle} />
              </Pressable>
            </View>
            <Button label="상세 정보 보기" onPress={() => onOpenDetail(previewPlace)} />
          </View>
        ) : null}

        {!apiEnabled ? <Text style={styles.errorText}>API URL이 설정되지 않았습니다.</Text> : null}
        {isError ? <Text style={styles.errorText}>관광지 목록을 불러오지 못했습니다.</Text> : null}
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
      </View>

      {isSheetOpen ? (
        <>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsSheetOpen(false)} />
          <View style={styles.sheetPanel}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.cardTitle}>관광지 목록</Text>
              <Text style={styles.cardBody}>지도 마커와 연동된 장소를 확인할 수 있어요.</Text>
              <Button label="현재 위치 방문 판정 (데모)" onPress={onCheckVisit} />
            </View>
            <FlatList
              data={places}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.sheetList}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!loading && hasNext) {
                  onLoadMore();
                }
              }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setIsSheetOpen(false);
                    onOpenDetail(item);
                  }}
                >
                  <Card>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardBody}>
                      {item.category} · {item.address}
                    </Text>
                  </Card>
                </Pressable>
              )}
              ListFooterComponent={
                <View style={styles.listFooter}>
                  {loading ? <ActivityIndicator color={colors.brand[600]} /> : null}
                  {!loading && hasNext ? (
                    <Pressable style={styles.moreBtn} onPress={onLoadMore}>
                      <Text style={styles.moreText}>더 보기</Text>
                    </Pressable>
                  ) : null}
                  {!loading && !hasNext && places.length > 0 ? <Text style={styles.endText}>모든 관광지를 불러왔어요.</Text> : null}
                </View>
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.imageFallback}>
                    <Ionicons name="search-outline" size={22} color={colors.base.textSubtle} />
                    <Text style={styles.cardBody}>관광지 데이터가 없습니다.</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
