import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WalkRecord } from "../../mocks/walkingData";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type RecordDetailScreenProps = { record: WalkRecord; onBack: () => void };

export function RecordDetailScreen({ record, onBack }: RecordDetailScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="기록 상세"
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        rightIcon={<Ionicons name="ellipsis-vertical" size={20} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapBox} />
        <Text style={styles.title}>{record.title}</Text>
        <Text style={styles.sub}>{record.startedAt}</Text>
        <View style={styles.grid}>
          <View><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.metricValue}>{record.distanceKm}km</Text></View>
          <View><Text style={styles.metricLabel}>소요 시간</Text><Text style={styles.metricValue}>{record.durationText}</Text></View>
          <View><Text style={styles.metricLabel}>평균 페이스</Text><Text style={styles.metricValue}>{record.paceText}</Text></View>
          <View><Text style={styles.metricLabel}>시작 시간</Text><Text style={styles.metricValue}>09:30 AM</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  mapBox: { height: 220, borderRadius: radius.xl, backgroundColor: colors.base.subtle },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  sub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg, columnGap: spacing.x4 },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
});
