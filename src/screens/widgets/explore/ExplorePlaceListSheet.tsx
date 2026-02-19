import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Animated, FlatList, Pressable, Text, View } from "react-native";
import { Card } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";
import { useBottomSheetSnap } from "./useBottomSheetSnap";

type ExplorePlaceListSheetProps = {
  visible: boolean;
  places: PlaceItem[];
  collectedPlaceIds: string[];
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  onClose: () => void;
  onOpenDetail: (place: PlaceItem) => void;
  bottomOffset?: number;
};

export function ExplorePlaceListSheet({
  visible,
  places,
  collectedPlaceIds,
  loading,
  hasNext,
  onLoadMore,
  onClose,
  onOpenDetail,
  bottomOffset = 0,
}: ExplorePlaceListSheetProps) {
  const collectedPlaceIdSet = React.useMemo(() => new Set(collectedPlaceIds), [collectedPlaceIds]);
  const { expanded, translateY, setExpandedState, reset, panHandlers } = useBottomSheetSnap({
    visible,
    collapsedOffset: 200,
  });

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.sheetPanel, { bottom: expanded ? -bottomOffset : bottomOffset, transform: [{ translateY }] }]}
    >
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHeaderRow}>
          <Text style={styles.cardTitle}>관광지 목록</Text>
          <Pressable onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.base.textSubtle} />
          </Pressable>
        </View>
        <Text style={styles.cardBody}>겹친 마커의 장소를 선택할 수 있어요.</Text>
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
              handleClose();
              onOpenDetail(item);
            }}
          >
            <Card>
              <View style={styles.sheetCardContent}>
                <View style={styles.sheetHeaderRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <Text style={styles.cardBody}>{item.address}</Text>
                {collectedPlaceIdSet.has(item.id) ? (
                  <View style={styles.collectedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.brand[700]} />
                    <Text style={styles.collectedBadgeText}>수집 완료</Text>
                  </View>
                ) : null}
              </View>
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
    </Animated.View>
  );
}
