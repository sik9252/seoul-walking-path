import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
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
  userLocation: { latitude: number; longitude: number } | null;
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
  const markerPlaces = places.slice(0, 200);
  const initialRegion = {
    latitude: userLocation?.latitude ?? 37.5665,
    longitude: userLocation?.longitude ?? 126.978,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <FlatList
      data={places}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.screen}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (!loading && hasNext) {
          onLoadMore();
        }
      }}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.title}>탐험</Text>
          <Text style={styles.description}>근처 관광지에 도달해 카드를 수집하세요.</Text>
          <View style={styles.mapWrap}>
            <MapView style={styles.map} initialRegion={initialRegion} region={initialRegion} showsUserLocation>
              {userLocation ? (
                <Marker
                  coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                  title="내 위치"
                  pinColor={colors.brand[700]}
                />
              ) : null}
              {markerPlaces.map((place) => (
                <Marker
                  key={place.id}
                  coordinate={{ latitude: place.lat, longitude: place.lng }}
                  title={place.name}
                  description={place.address}
                  onPress={() => onOpenDetail(place)}
                />
              ))}
            </MapView>
            <View style={styles.mapMetaRow}>
              <Text style={styles.cardBody}>지도 핀: {markerPlaces.length}개 (로드된 목록 기준)</Text>
              <Pressable onPress={onRefreshLocation}>
                <Text style={styles.moreText}>{isLoadingLocation ? "위치 확인중..." : "내 위치 새로고침"}</Text>
              </Pressable>
            </View>
            {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
          </View>
          <Button label="현재 위치 방문 판정 (데모)" onPress={onCheckVisit} />
          {!apiEnabled ? <Text style={styles.errorText}>API URL이 설정되지 않았습니다.</Text> : null}
          {isError ? <Text style={styles.errorText}>관광지 목록을 불러오지 못했습니다.</Text> : null}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => onOpenDetail(item)}>
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
  );
}
