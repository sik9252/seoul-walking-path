import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card, RegionTag } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";
import { useBottomSheetSnap } from "./useBottomSheetSnap";

type ExplorePlaceDetailSheetProps = {
  place: PlaceItem | null;
  isCollected: boolean;
  onClose: () => void;
  bottomOffset?: number;
  onExpandedChange?: (expanded: boolean) => void;
};

export function ExplorePlaceDetailSheet({
  place,
  isCollected,
  onClose,
  bottomOffset = 0,
  onExpandedChange,
}: ExplorePlaceDetailSheetProps) {
  const collapsedOffset = 560;
  const { expanded, translateY, setExpandedState, reset, panHandlers } = useBottomSheetSnap({
    visible: Boolean(place),
    collapsedOffset,
  });

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  React.useEffect(() => {
    onExpandedChange?.(Boolean(place) && expanded);
  }, [expanded, onExpandedChange, place]);

  if (!place) return null;

  const tabBarCoverShift = translateY.interpolate({
    inputRange: [0, collapsedOffset],
    outputRange: [bottomOffset, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.placeDetailSheetPanel,
        {
          bottom: bottomOffset,
          transform: [{ translateY: Animated.add(translateY, tabBarCoverShift) }],
        },
      ]}
    >
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
            <View style={styles.floatingPlaceTitleRow}>
              <RegionTag region={place.region} />
              <Text style={[styles.cardTitle, styles.floatingPlaceTitleText]} numberOfLines={1}>
                {place.name}
              </Text>
              {isCollected ? (
                <View style={styles.collectedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.brand[700]} />
                  <Text style={styles.collectedBadgeText}>수집 완료</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardBody}>{place.address}</Text>
          </View>
          <Pressable style={styles.placeDetailCloseButtonRaised} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.base.textSubtle} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
