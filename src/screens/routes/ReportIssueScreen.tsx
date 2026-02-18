import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type ReportIssueScreenProps = { onBack: () => void };

export function ReportIssueScreen({ onBack }: ReportIssueScreenProps) {
  const [reason, setReason] = React.useState("길이 막혔어요");
  const [detail, setDetail] = React.useState("");
  const reasons = ["길이 막혔어요", "정보가 틀려요", "시설물이 없어요", "기타"];

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="문제 신고"
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>트레킹 중 발견한 문제나 잘못된 정보를 알려주세요.</Text>
        <Text style={styles.body}>서울걷길을 더 좋게 만드는 데 큰 도움이 됩니다.</Text>
        <Card style={{ padding: 0 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>신고 유형 선택</Text>
          </View>
          {reasons.map((item) => (
            <Pressable key={item} style={styles.radioRow} onPress={() => setReason(item)}>
              <Text style={styles.body}>{item}</Text>
              <Ionicons
                name={reason === item ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={reason === item ? colors.brand[600] : colors.base.textSubtle}
              />
            </Pressable>
          ))}
        </Card>
        <TextInput
          placeholder="상세 내용 (선택)"
          placeholderTextColor={colors.base.textSubtle}
          value={detail}
          onChangeText={setDetail}
          multiline
          style={styles.input}
        />
      </ScrollView>
      <View style={styles.bottomCta}>
        <Button label="제출하기" onPress={onBack} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  body: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
  },
  sectionHeader: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
  sectionHeaderText: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  radioRow: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    minHeight: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.base.border,
    padding: spacing.lg,
    color: colors.base.text,
    textAlignVertical: "top",
  },
  bottomCta: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
