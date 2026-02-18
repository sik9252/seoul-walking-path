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
        <View style={styles.mapBox}>
          <View style={styles.routeMock} />
        </View>
        <Text style={styles.title}>{record.title}</Text>
        <Text style={styles.sub}>{record.startedAt}</Text>
        <View style={styles.grid}>
          <View style={styles.metricBlock}>
            <View style={styles.metricRow}><Ionicons name="resize-outline" size={16} color={colors.base.textSubtle} /><Text style={styles.metricLabel}>총 거리</Text></View>
            <Text style={styles.metricValue}>{record.distanceKm}km</Text>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.metricRow}><Ionicons name="time-outline" size={16} color={colors.base.textSubtle} /><Text style={styles.metricLabel}>소요 시간</Text></View>
            <Text style={styles.metricValue}>{record.durationText}</Text>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.metricRow}><Ionicons name="speedometer-outline" size={16} color={colors.base.textSubtle} /><Text style={styles.metricLabel}>평균 페이스</Text></View>
            <Text style={styles.metricValue}>{record.paceText}</Text>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.metricRow}><Ionicons name="play-outline" size={16} color={colors.base.textSubtle} /><Text style={styles.metricLabel}>시작 시간</Text></View>
            <Text style={styles.metricValue}>09:30 AM</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  mapBox: {
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: "#CED4CA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  routeMock: {
    width: "70%",
    height: "56%",
    borderRadius: radius.xl,
    borderWidth: 6,
    borderColor: colors.brand[700],
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  sub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg, columnGap: spacing.x4 },
  metricBlock: { minWidth: "40%", gap: 2 },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
});
