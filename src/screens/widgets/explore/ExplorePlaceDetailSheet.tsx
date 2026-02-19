import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { PlaceItem } from "../../../types/gameTypes";

type ExplorePlaceDetailSheetProps = {
  place: PlaceItem | null;
  onClose: () => void;
  onOpenDetail: (place: PlaceItem) => void;
};

export function ExplorePlaceDetailSheet({
  place,
  onClose,
  onOpenDetail,
}: ExplorePlaceDetailSheetProps) {
  if (!place) return null;

  return (
    <>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.placeDetailSheetPanel}>
        <View style={styles.sheetHandle} />
        <ScrollView contentContainerStyle={styles.placeDetailSheetContent}>
          <View style={styles.placeDetailSheetHeader}>
            <Text style={styles.title}>{place.name}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.base.textSubtle} />
            </Pressable>
          </View>
          <Text style={styles.description}>{place.category}</Text>

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

          <Pressable
            style={styles.moreBtn}
            onPress={() => {
              onClose();
              onOpenDetail(place);
            }}
          >
            <Text style={styles.moreText}>전체 상세 화면으로 열기</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}
