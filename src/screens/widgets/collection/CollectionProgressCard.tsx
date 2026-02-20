import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { LevelProgress } from "../../../utils/leveling";

type CollectionProgressCardProps = {
  collectedCount: number;
  totalCount: number;
  levelProgress: LevelProgress;
};

export function CollectionProgressCard({ collectedCount, totalCount, levelProgress }: CollectionProgressCardProps) {
  const ratio = totalCount > 0 ? Math.min(1, collectedCount / totalCount) : 0;
  const percent = Math.round(ratio * 100);
  const nextRemain = Math.max(0, levelProgress.expForNextLevel - levelProgress.expInLevel);

  return (
    <View style={styles.collectionProgressCard}>
      <View style={styles.collectionProgressTop}>
        <View style={styles.collectionProgressTextWrap}>
          <Text style={styles.collectionProgressLevel}>탐험가 레벨 {levelProgress.level}</Text>
          <Text style={styles.collectionProgressTitle}>
            {collectedCount} / {totalCount}
          </Text>
          <Text style={styles.collectionProgressSubtle}>다음 레벨까지 {nextRemain} EXP</Text>
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
