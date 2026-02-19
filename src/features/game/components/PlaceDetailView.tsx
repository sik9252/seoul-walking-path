import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card } from "../../../components/ui";
import { colors } from "../../../theme/tokens";
import { gameStyles as styles } from "../styles";
import { PlaceItem } from "../types";

type Props = {
  place: PlaceItem;
  onBack: () => void;
};

export function PlaceDetailView({ place, onBack }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color={colors.base.text} />
        <Text style={styles.backText}>목록으로</Text>
      </Pressable>

      <Text style={styles.title}>{place.name}</Text>
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
    </ScrollView>
  );
}
