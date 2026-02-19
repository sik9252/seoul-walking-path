import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Button } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";

type ExplorePlacePreviewCardProps = {
  place: PlaceItem | null;
  onClose: () => void;
  onOpenDetail: (place: PlaceItem) => void;
};

export function ExplorePlacePreviewCard({
  place,
  onClose,
  onOpenDetail,
}: ExplorePlacePreviewCardProps) {
  if (!place) return null;

  return (
    <View style={styles.floatingPlaceCard}>
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
          <Text style={styles.cardBody} numberOfLines={1}>
            {place.category} · {place.address}
          </Text>
        </View>
        <Pressable onPress={onClose}>
          <Ionicons name="close" size={18} color={colors.base.textSubtle} />
        </Pressable>
      </View>
      <Button label="상세 정보 보기" onPress={() => onOpenDetail(place)} />
    </View>
  );
}
