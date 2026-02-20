import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/ui";
import { colors, radius, shadow, spacing, typography } from "../../../theme/tokens";

type Rarity = "common" | "rare" | "epic" | "legendary";

type RewardCard = {
  placeName: string;
  address?: string;
  imageUrl?: string | null;
  rarity: Rarity;
};

type Props = {
  visible: boolean;
  card: RewardCard | null;
  hasNext: boolean;
  isCollectingNext: boolean;
  onClose: () => void;
  onCollectNext: () => void;
};

const RARITY_THEME: Record<
  Rarity,
  {
    title: string;
    chipBg: string;
    chipText: string;
    frameColor: string;
    bgColor: string;
    accent: string;
  }
> = {
  common: {
    title: "새로운 스팟 카드 발견!",
    chipBg: "#18D860",
    chipText: "#042412",
    frameColor: "#18D860",
    bgColor: "#F3FFF7",
    accent: "#18D860",
  },
  rare: {
    title: "특별한 장소 카드 발견!",
    chipBg: "#2563EB",
    chipText: "#EAF2FF",
    frameColor: "#2563EB",
    bgColor: "#F5F8FF",
    accent: "#2563EB",
  },
  epic: {
    title: "강력한 에픽 카드 발견!",
    chipBg: "#A21CEF",
    chipText: "#F7E8FF",
    frameColor: "#A21CEF",
    bgColor: "#170726",
    accent: "#C55CFF",
  },
  legendary: {
    title: "1%의 전설 카드 발견!",
    chipBg: "#F3B312",
    chipText: "#2A1900",
    frameColor: "#F3B312",
    bgColor: "#1B1507",
    accent: "#F3B312",
  },
};

export function ExploreCardRewardModal({ visible, card, hasNext, isCollectingNext, onClose, onCollectNext }: Props) {
  if (!card) return null;
  const theme = RARITY_THEME[card.rarity];
  const isDark = card.rarity === "epic" || card.rarity === "legendary";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={isDark ? "#E9D5FF" : colors.base.text} />
          </Pressable>

          <Text style={[styles.discoveryLabel, { color: theme.accent }]}>{card.rarity.toUpperCase()} CARD</Text>
          <Text style={[styles.title, { color: isDark ? "#F8FAFC" : colors.base.text }]}>{theme.title}</Text>

          <View style={[styles.imageFrame, { borderColor: theme.frameColor }]}>
            {card.imageUrl ? (
              <Image source={{ uri: card.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.imageFallback}>
                <Ionicons name="image-outline" size={36} color={isDark ? "#E5E7EB" : colors.base.textSubtle} />
              </View>
            )}
            <View style={[styles.rarityChip, { backgroundColor: theme.chipBg }]}>
              <Text style={[styles.rarityChipText, { color: theme.chipText }]}>{card.rarity.toUpperCase()}</Text>
            </View>
            <View style={styles.imageTextWrap}>
              <Text style={styles.placeName} numberOfLines={1}>
                {card.placeName}
              </Text>
              <Text style={styles.placeAddress} numberOfLines={1}>
                {card.address || "대한민국"}
              </Text>
            </View>
          </View>

          {hasNext ? (
            <Button
              label={isCollectingNext ? "다음 수집 중..." : "다음 스팟 수집"}
              onPress={onCollectNext}
              disabled={isCollectingNext}
            />
          ) : (
            <Button label="컬렉션에 추가 완료" onPress={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 6, 8, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  container: {
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.level2,
  },
  closeBtn: {
    alignSelf: "flex-start",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  discoveryLabel: {
    fontSize: typography.size.labelSm,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
  },
  imageFrame: {
    borderRadius: radius.lg,
    borderWidth: 3,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 0.9,
  },
  imageFallback: {
    width: "100%",
    aspectRatio: 0.9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  rarityChip: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rarityChipText: {
    fontWeight: "800",
    fontSize: typography.size.caption,
    letterSpacing: 0.4,
  },
  imageTextWrap: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 4,
  },
  placeName: {
    fontSize: typography.size.bodyLg,
    fontWeight: typography.weight.semibold,
    color: "#FFFFFF",
  },
  placeAddress: {
    fontSize: typography.size.caption,
    color: "#E5E7EB",
  },
});
