import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";
import { useBottomSheetSnap } from "./useBottomSheetSnap";

type ExplorePlaceDetailSheetProps = {
  place: PlaceItem | null;
  onClose: () => void;
  bottomOffset?: number;
};

export function ExplorePlaceDetailSheet({ place, onClose, bottomOffset = 0 }: ExplorePlaceDetailSheetProps) {
  const collapsedOffset = 560;
  const { expanded, translateY, setExpandedState, reset, panHandlers } = useBottomSheetSnap({
    visible: Boolean(place),
    collapsedOffset,
  });

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  if (!place) return null;

  const tabBarCoverShift = translateY.interpolate({
    inputRange: [0, collapsedOffset],
    outputRange: [bottomOffset, 0],
    extrapolate: "clamp",
  });

  return (
    <>
      {expanded ? <Pressable style={styles.sheetBackdrop} onPress={handleClose} /> : null}
      <Animated.View
        style={[
          styles.placeDetailSheetPanel,
          {
            bottom: bottomOffset,
            transform: [{ translateY: Animated.add(translateY, tabBarCoverShift) }],
          },
        ]}
      >
        <View style={styles.sheetHandleTouch} {...panHandlers}>
          <Pressable onPress={() => setExpandedState(!expanded)} hitSlop={8}>
            <View style={styles.sheetHandle} />
          </Pressable>
        </View>
        {expanded ? (
          <ScrollView contentContainerStyle={styles.placeDetailSheetContent}>
            <View style={styles.placeDetailSheetHeader}>
              <Text style={styles.title}>{place.name}</Text>
              <Pressable onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.base.textSubtle} />
              </Pressable>
            </View>

            {place.imageUrl ? (
              <Image source={{ uri: place.imageUrl }} style={styles.placeImage} resizeMode="cover" />
            ) : (
              <View style={styles.imageFallback}>
                <Ionicons name="image-outline" size={22} color={colors.base.textSubtle} />
                <Text style={styles.cardBody}>이미지가 없습니다.</Text>
              </View>
            )}

            <Card>
              <Text style={styles.detailLabel}>주소</Text>
              <Text style={styles.cardBody}>{place.address || "주소 정보 없음"}</Text>
            </Card>

            <Card>
              <Text style={styles.detailLabel}>위치 좌표</Text>
              <Text style={styles.cardBody}>
                위도 {place.lat.toFixed(6)} / 경도 {place.lng.toFixed(6)}
              </Text>
            </Card>

            <Card>
              <Text style={styles.detailLabel}>설명</Text>
              <Text style={styles.cardBody}>
                {place.name}는 {place.category} 카테고리 관광지입니다. 방문 반경 안에 들어오면 카드 수집이 가능합니다.
              </Text>
            </Card>
          </ScrollView>
        ) : (
          <View style={styles.placeDetailCollapsedContent}>
            <View style={styles.floatingPlaceTop}>
              {place.imageUrl ? (
                <Image source={{ uri: place.imageUrl }} style={styles.floatingPlaceImage} />
              ) : (
                <View style={styles.floatingPlaceImageFallback}>
                  <Ionicons name="image-outline" size={20} color={colors.base.textSubtle} />
                </View>
              )}
              <View style={styles.floatingPlaceTextWrap}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.cardBody}>{place.address}</Text>
              </View>
              <Pressable onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.base.textSubtle} />
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </>
  );
}
