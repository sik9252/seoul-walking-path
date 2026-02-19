import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";

type CollectionProgressCardProps = {
  collectedCount: number;
  totalCount: number;
};

function getLevelByCount(count: number) {
  if (count >= 40) return 5;
  if (count >= 30) return 4;
  if (count >= 20) return 3;
  if (count >= 10) return 2;
  return 1;
}

export function CollectionProgressCard({ collectedCount, totalCount }: CollectionProgressCardProps) {
  const level = getLevelByCount(collectedCount);
  const ratio = totalCount > 0 ? Math.min(1, collectedCount / totalCount) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <View style={styles.collectionProgressCard}>
      <View style={styles.collectionProgressTop}>
        <View style={styles.collectionProgressTextWrap}>
          <Text style={styles.collectionProgressLevel}>탐험가 레벨 {level}</Text>
          <Text style={styles.collectionProgressTitle}>
            {collectedCount} / {totalCount}
          </Text>
        </View>
        <View style={styles.collectionProgressTrophyWrap}>
          <Ionicons name="trophy" size={28} color={colors.brand[500]} />
        </View>
      </View>
      <View style={styles.collectionProgressTrack}>
        <View style={[styles.collectionProgressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.collectionProgressPercent}>{percent}% 수집</Text>
    </View>
  );
}
