import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Card } from "../../components/ui";
import { colors, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

export function SettingsScreen() {
  const [voice, setVoice] = React.useState(true);
  return (
    <View style={styles.screen}>
      <ScreenHeader title="설정" leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileWrap}>
          <View style={styles.avatar} />
          <Text style={styles.title}>김서울</Text>
          <Text style={styles.sub}>seoul_walker@email.com</Text>
        </View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.metricValue}>124km</Text></Card>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>완주 코스</Text><Text style={styles.metricValue}>15개</Text></Card>
        </View>

        <Text style={styles.section}>계정</Text>
        {["내 정보 수정", "알림 설정", "개인정보 및 보안"].map((label) => (
          <View key={label} style={styles.settingRow}><Text style={styles.body}>{label}</Text><Text>›</Text></View>
        ))}

        <Text style={styles.section}>앱 설정</Text>
        <View style={styles.settingRow}>
          <Text style={styles.body}>음성 안내</Text>
          <Switch value={voice} onValueChange={setVoice} trackColor={{ true: colors.brand[600] }} />
        </View>

        <Text style={styles.section}>지원</Text>
        {["도움말", "앱 정보"].map((label) => (
          <View key={label} style={styles.settingRow}><Text style={styles.body}>{label}</Text><Text>›</Text></View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  profileWrap: { alignItems: "center", gap: spacing.sm },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.base.subtleAlt },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  sub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  metricRow: { flexDirection: "row", gap: spacing.sm },
  metricCard: { flex: 1, alignItems: "center" },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: { color: colors.base.text, fontSize: typography.size.titleSm, fontWeight: typography.weight.bold },
  section: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.sm,
  },
  body: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd, lineHeight: typography.lineHeight.bodyMd },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
});
