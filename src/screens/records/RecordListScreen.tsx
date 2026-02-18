import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip } from "../../components/ui";
import { WalkRecord } from "../../mocks/walkingData";
import { colors, spacing, typography } from "../../theme/tokens";
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
          <Text style={styles.metricLabel}>이번 주 활동</Text>
          <Text style={styles.weekDistance}>28.4 km</Text>
        </Card>
        <View style={styles.chips}>
          <Chip label="전체" selected />
          <Chip label="산책" />
          <Chip label="트레킹" />
          <Chip label="등산" />
        </View>
        {records.map((record) => (
          <Card key={record.id}>
            <Pressable onPress={() => onOpenRecord(record)}>
              <Text style={styles.title}>{record.title}</Text>
              <Text style={styles.info}>{record.startedAt}</Text>
              <Text style={styles.info}>
                {record.distanceKm}km · {record.durationText}
              </Text>
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
  weekCard: { backgroundColor: colors.base.subtle },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  weekDistance: { marginTop: spacing.xs, color: colors.brand[700], fontSize: 36, fontWeight: typography.weight.bold },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  title: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  info: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd, marginTop: 2 },
});
