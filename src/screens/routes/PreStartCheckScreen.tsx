import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type PreStartCheckScreenProps = { onBack: () => void; onStart: () => void };

export function PreStartCheckScreen({ onBack, onStart }: PreStartCheckScreenProps) {
  const [shoeChecked, setShoeChecked] = React.useState(true);
  const [waterChecked, setWaterChecked] = React.useState(true);
  const [batteryChecked, setBatteryChecked] = React.useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="출발 전 체크리스트"
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand[600]} />
            <Text style={styles.checkItem}>현재 날씨 맑음</Text>
          </View>
          <Text style={styles.checkSub}>기온 21°C · 미세먼지 좋음</Text>
        </Card>
        <Card>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand[600]} />
            <Text style={styles.checkItem}>GPS 신호 양호</Text>
          </View>
          <Text style={styles.checkSub}>위치 정확도 높음</Text>
        </Card>

        <Text style={styles.sectionTitle}>준비물 확인</Text>
        <Pressable onPress={() => setShoeChecked((v) => !v)}>
          <View style={styles.row}>
            <Ionicons
              name={shoeChecked ? "checkbox" : "square-outline"}
              size={18}
              color={shoeChecked ? colors.brand[600] : colors.base.textSubtle}
            />
            <Text style={styles.checkItem}>편안한 운동화 착용</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setWaterChecked((v) => !v)}>
          <View style={styles.row}>
            <Ionicons
              name={waterChecked ? "checkbox" : "square-outline"}
              size={18}
              color={waterChecked ? colors.brand[600] : colors.base.textSubtle}
            />
            <Text style={styles.checkItem}>충분한 식수 준비</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setBatteryChecked((v) => !v)}>
          <View style={styles.row}>
            <Ionicons
              name={batteryChecked ? "checkbox" : "square-outline"}
              size={18}
              color={batteryChecked ? colors.brand[600] : colors.base.textSubtle}
            />
            <Text style={styles.checkItem}>보조 배터리(권장)</Text>
          </View>
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
  checkItem: { color: colors.base.text, fontSize: typography.size.labelLg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkSub: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  warnBox: {
    marginTop: spacing.md,
    backgroundColor: colors.semantic.errorBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  warnTitle: { color: colors.semantic.error, fontWeight: typography.weight.bold, marginBottom: 4 },
  warnText: { color: colors.semantic.errorText },
  bottomDual: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
  },
});
