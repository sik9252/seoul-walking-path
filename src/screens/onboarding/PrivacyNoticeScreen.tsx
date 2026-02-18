import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui";
import { colors, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type PrivacyNoticeScreenProps = {
  onBack: () => void;
};

export function PrivacyNoticeScreen({ onBack }: PrivacyNoticeScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="개인정보 고지"
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>위치 및 이동경로 정보 처리 안내</Text>
        <Text style={styles.body}>
          서울걷길은 코스 추천과 산책 기록 기능 제공을 위해 위치 및 이동경로 정보를 수집합니다.
          수집된 정보는 앱 기능 제공 목적 범위 내에서만 사용되며, 사용자는 권한 설정에서 언제든 변경할 수 있습니다.
        </Text>

        <Text style={styles.section}>수집 항목</Text>
        <Text style={styles.body}>- 현재 위치(위도/경도){"\n"}- 이동 경로{"\n"}- 산책 시작/종료 시각, 거리, 시간</Text>

        <Text style={styles.section}>이용 목적</Text>
        <Text style={styles.body}>- 내 주변 코스 추천{"\n"}- 산책 기록 통계 제공{"\n"}- 트래킹 품질 개선</Text>

        <Text style={styles.section}>보관 및 삭제</Text>
        <Text style={styles.body}>
          기록은 기본적으로 로컬 저장소에 보관되며, 사용자는 기록 삭제 기능을 통해 개별/전체 삭제할 수 있습니다.
        </Text>
      </ScrollView>
      <View style={styles.bottom}>
        <Button label="확인" onPress={onBack} style={{ width: "100%" }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.x3 },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
  section: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.sm,
  },
  body: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
  },
  bottom: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.base.border,
  },
});
