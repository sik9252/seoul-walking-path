import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { colors, spacing, typography } from "../../theme/tokens";

type PermissionScreenProps = {
  onAllow: () => void;
  onLater: () => void;
  onOpenPrivacyNotice: () => void;
};

export function PermissionScreen({ onAllow, onLater, onOpenPrivacyNotice }: PermissionScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📍</Text>
      </View>
      <Text style={styles.title}>위치 권한이 필요해요</Text>
      <Text style={styles.sub}>내 주변 코스 추천과 산책 기록을 위해 사용됩니다.</Text>

      <View style={styles.features}>
        <Card>
          <Text style={styles.featureTitle}>내 주변 코스 추천</Text>
          <Text style={styles.featureSub}>지금 위치 기준으로 빠르게 탐색</Text>
        </Card>
        <Card>
          <Text style={styles.featureTitle}>산책 경로 기록</Text>
          <Text style={styles.featureSub}>거리, 시간, 경로를 자동 저장</Text>
        </Card>
      </View>

      <View style={styles.bottom}>
        <Button label="위치 권한 허용하기" onPress={onAllow} style={{ width: "100%" }} />
        <Button label="개인정보 고지 보기" variant="secondary" onPress={onOpenPrivacyNotice} style={{ width: "100%" }} />
        <Button label="나중에 하기" variant="ghost" onPress={onLater} style={{ width: "100%" }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base.background,
    padding: spacing.lg,
  },
  hero: {
    marginTop: spacing.x3,
    alignSelf: "center",
    width: 160,
    height: 160,
    borderRadius: 32,
    backgroundColor: colors.brand[100],
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    fontSize: 54,
  },
  title: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.base.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: typography.weight.bold,
  },
  sub: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyLg,
    lineHeight: typography.lineHeight.bodyLg,
  },
  features: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  featureTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  featureSub: {
    marginTop: 2,
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
  },
  bottom: {
    marginTop: "auto",
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
