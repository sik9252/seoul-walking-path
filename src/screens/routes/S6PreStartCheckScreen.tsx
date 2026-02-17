import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type S6Props = { onBack: () => void; onStart: () => void };

export function S6PreStartCheckScreen({ onBack, onStart }: S6Props) {
  const [shoeChecked, setShoeChecked] = React.useState(true);
  const [waterChecked, setWaterChecked] = React.useState(true);
  const [batteryChecked, setBatteryChecked] = React.useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="출발 전 체크리스트" leftLabel="←" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.checkItem}>✅ 현재 날씨 맑음</Text>
          <Text style={styles.checkSub}>기온 21°C · 미세먼지 좋음</Text>
        </Card>
        <Card>
          <Text style={styles.checkItem}>✅ GPS 신호 양호</Text>
          <Text style={styles.checkSub}>위치 정확도 높음</Text>
        </Card>

        <Text style={styles.sectionTitle}>준비물 확인</Text>
        <Pressable onPress={() => setShoeChecked((v) => !v)}>
          <Text style={styles.checkItem}>{shoeChecked ? "☑" : "☐"} 편안한 운동화 착용</Text>
        </Pressable>
        <Pressable onPress={() => setWaterChecked((v) => !v)}>
          <Text style={styles.checkItem}>{waterChecked ? "☑" : "☐"} 충분한 식수 준비</Text>
        </Pressable>
        <Pressable onPress={() => setBatteryChecked((v) => !v)}>
          <Text style={styles.checkItem}>{batteryChecked ? "☑" : "☐"} 보조 배터리(권장)</Text>
        </Pressable>

        <View style={styles.warnBox}>
          <Text style={styles.warnTitle}>배터리 잔량 확인</Text>
          <Text style={styles.warnText}>현재 배터리 45%로 장시간 트래킹 시 부족할 수 있어요.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomDual}>
        <Button label="나중에 하기" variant="secondary" onPress={onBack} style={{ flex: 1 }} />
        <Button label="산책 시작하기" onPress={onStart} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  sectionTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  checkItem: { color: colors.base.text, fontSize: typography.size.labelLg, marginBottom: spacing.sm },
  checkSub: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  warnBox: {
    marginTop: spacing.md,
    backgroundColor: "#FDE8E8",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  warnTitle: { color: colors.semantic.error, fontWeight: typography.weight.bold, marginBottom: 4 },
  warnText: { color: "#7F1D1D" },
  bottomDual: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
  },
});
