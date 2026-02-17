import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip, Input, TabBar } from "./src/components/ui";
import { colors, spacing, typography } from "./src/theme/tokens";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>서울걷길 UI Foundation</Text>
        <Text style={styles.subtitle}>Expo 실행 확인용 기본 화면</Text>

        <Card>
          <Input placeholder="산책로 검색" />
          <View style={styles.row}>
            <Chip label="필터" selected />
            <Chip label="숲길" />
            <Chip label="수변" />
          </View>
          <View style={styles.row}>
            <Button label="산책 시작" />
          </View>
        </Card>
      </ScrollView>
      <TabBar
        activeKey="home"
        onPressTab={() => {}}
        tabs={[
          { key: "home", label: "홈" },
          { key: "course", label: "코스" },
          { key: "record", label: "기록" },
          { key: "my", label: "마이" },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
    fontWeight: typography.weight.regular,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
