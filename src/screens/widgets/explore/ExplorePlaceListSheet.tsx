import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { Button, Card } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";

type ExplorePlaceListSheetProps = {
  visible: boolean;
  places: PlaceItem[];
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  onClose: () => void;
  onCheckVisit: () => void;
  onOpenDetail: (place: PlaceItem) => void;
};

export function ExplorePlaceListSheet({
  visible,
  places,
  loading,
  hasNext,
  onLoadMore,
  onClose,
  onCheckVisit,
  onOpenDetail,
}: ExplorePlaceListSheetProps) {
  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetPanel}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.cardTitle}>관광지 목록</Text>
          <Text style={styles.cardBody}>지도 마커와 연동된 장소를 확인할 수 있어요.</Text>
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
                onClose();
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
              {!loading && !hasNext && places.length > 0 ? (
                <Text style={styles.endText}>모든 관광지를 불러왔어요.</Text>
              ) : null}
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
  );
}
