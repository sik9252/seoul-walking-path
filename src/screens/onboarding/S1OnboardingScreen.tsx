import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { colors, spacing, typography } from "../../theme/tokens";

type S1OnboardingScreenProps = {
  onStart: () => void;
};

export function S1OnboardingScreen({ onStart }: S1OnboardingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🥾</Text>
      </View>
      <Text style={styles.title}>서울 산책을 더 쉽게</Text>
      <Text style={styles.sub}>코스 탐색부터 트래킹, 기록까지 한 번에.</Text>

      <View style={styles.features}>
        <Card>
          <Text style={styles.featureTitle}>내 주변 코스 추천</Text>
          <Text style={styles.featureSub}>가까운 걷기 좋은 길 찾기</Text>
        </Card>
        <Card>
          <Text style={styles.featureTitle}>산책 경로 기록</Text>
          <Text style={styles.featureSub}>이동 경로와 시간을 자동 저장</Text>
        </Card>
        <Card>
          <Text style={styles.featureTitle}>주변 편의시설 안내</Text>
          <Text style={styles.featureSub}>화장실, 편의점, 역 정보 확인</Text>
        </Card>
      </View>

      <View style={styles.bottom}>
        <Button label="시작하기" onPress={onStart} style={{ width: "100%" }} />
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
    backgroundColor: colors.brand[200],
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 52,
  },
  title: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.base.text,
    fontSize: 34,
    lineHeight: 40,
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
  },
});
