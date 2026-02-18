import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip } from "../../components/ui";
import { WalkRecord } from "../../mocks/walkingData";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type RecordListScreenProps = { records: WalkRecord[]; onOpenRecord: (record: WalkRecord) => void };

export function RecordListScreen({ records, onOpenRecord }: RecordListScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="나의 기록"
        rightIcon={<Ionicons name="calendar-outline" size={21} color={colors.base.text} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.weekCard}>
          <View style={styles.weekRow}>
            <Text style={styles.metricLabel}>이번 주 활동</Text>
            <Text style={styles.weekDistance}>28.4 km</Text>
          </View>
          <View style={styles.weekDays}>
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
        </Card>
        <View style={styles.chips}>
          <Chip label="전체" selected />
          <Chip label="산책" />
          <Chip label="트레킹" />
          <Chip label="등산" />
        </View>
        {records.map((record) => (
          <Card key={record.id} style={styles.recordCard}>
            <Pressable onPress={() => onOpenRecord(record)} style={styles.recordRow}>
              <View style={styles.recordIconTile}>
                <Ionicons name="trail-sign-outline" size={26} color={colors.brand[600]} />
              </View>
              <View style={styles.recordMeta}>
                <Text style={styles.title}>{record.title}</Text>
                <Text style={styles.info}>{record.startedAt}</Text>
                <View style={styles.recordInfoRow}>
                  <Ionicons name="location-outline" size={13} color={colors.base.textSubtle} />
                  <Text style={styles.info}>{record.distanceKm}km</Text>
                  <Ionicons name="time-outline" size={13} color={colors.base.textSubtle} />
                  <Text style={styles.info}>{record.durationText}</Text>
                </View>
              </View>
              <View style={styles.recordTimeBadge}>
                <Text style={styles.recordTimeBadgeText}>{record.startedAt.includes("오전") ? "오전" : "오후"}</Text>
              </View>
            </Pressable>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  weekCard: { backgroundColor: colors.base.subtle, minHeight: 154 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  weekDistance: { color: colors.brand[700], fontSize: 36, fontWeight: typography.weight.bold },
  weekDays: { marginTop: "auto", flexDirection: "row", justifyContent: "space-between" },
  weekDayText: { color: colors.base.textSubtle, fontSize: typography.size.caption },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  recordCard: { borderRadius: radius.lg },
  recordRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  recordIconTile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.base.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  recordMeta: { flex: 1 },
  recordInfoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  recordTimeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.base.subtle,
    borderRadius: radius.sm,
  },
  recordTimeBadgeText: { color: colors.base.textSubtle, fontSize: typography.size.caption },
  title: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  info: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd, marginTop: 2 },
});
