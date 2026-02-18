import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Card, Chip } from "../../components/ui";
import { colors, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type SettingsScreenProps = {
  trackingMode: "balanced" | "accurate";
  onChangeTrackingMode: (mode: "balanced" | "accurate") => void;
};

export function SettingsScreen({ trackingMode, onChangeTrackingMode }: SettingsScreenProps) {
  const [voice, setVoice] = React.useState(true);
  return (
    <View style={styles.screen}>
      <ScreenHeader title="설정" leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.base.textSubtle} />
          </View>
          <Text style={styles.title}>김서울</Text>
          <Text style={styles.sub}>seoul_walker@email.com</Text>
        </View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.metricValue}>124km</Text></Card>
          <Card style={styles.metricCard}><Text style={styles.metricLabel}>완주 코스</Text><Text style={styles.metricValue}>15개</Text></Card>
        </View>

        <Text style={styles.section}>계정</Text>
        {[
          { label: "내 정보 수정", icon: "person-outline" },
          { label: "알림 설정", icon: "notifications-outline" },
          { label: "개인정보 및 보안", icon: "lock-closed-outline" },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon as any} size={20} color={colors.base.textSubtle} />
              <Text style={styles.body}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.base.textSubtle} />
          </View>
        ))}

        <Text style={styles.section}>앱 설정</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="volume-high-outline" size={20} color={colors.base.textSubtle} />
            <Text style={styles.body}>음성 안내</Text>
          </View>
          <Switch value={voice} onValueChange={setVoice} trackColor={{ true: colors.brand[600] }} />
        </View>
        <View style={styles.modeWrap}>
          <Text style={styles.modeTitle}>트래킹 모드</Text>
          <View style={styles.modeChips}>
            <Chip
              label="균형"
              selected={trackingMode === "balanced"}
              onPress={() => onChangeTrackingMode("balanced")}
            />
            <Chip
              label="정확"
              selected={trackingMode === "accurate"}
              onPress={() => onChangeTrackingMode("accurate")}
            />
          </View>
          <Text style={styles.modeHint}>
            균형: 배터리 효율 우선 · 정확: 위치 샘플링 빈도/정밀도 우선
          </Text>
        </View>

        <Text style={styles.section}>지원</Text>
        {[
          { label: "도움말", icon: "help-circle-outline" },
          { label: "앱 정보", icon: "information-circle-outline" },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon as any} size={20} color={colors.base.textSubtle} />
              <Text style={styles.body}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.base.textSubtle} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  profileWrap: { alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.base.subtleAlt,
    alignItems: "center",
    justifyContent: "center",
  },
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
  settingLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
  modeWrap: { gap: spacing.sm },
  modeTitle: { color: colors.base.text, fontSize: typography.size.bodyMd, fontWeight: typography.weight.bold },
  modeChips: { flexDirection: "row", gap: spacing.sm },
  modeHint: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
});
