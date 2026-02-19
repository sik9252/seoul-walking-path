import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabItem } from "./src/components/ui";
import { colors, spacing, typography } from "./src/theme/tokens";

type GameTab = "explore" | "collection" | "my";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [tab, setTab] = React.useState<GameTab>("explore");

  const tabs: TabItem[] = [
    {
      key: "explore",
      label: "탐험",
      renderIcon: (active) => (
        <Ionicons
          name={active ? "compass" : "compass-outline"}
          size={18}
          color={active ? colors.brand[700] : colors.base.text}
        />
      ),
    },
    {
      key: "collection",
      label: "컬렉션",
      renderIcon: (active) => (
        <Ionicons
          name={active ? "albums" : "albums-outline"}
          size={18}
          color={active ? colors.brand[700] : colors.base.text}
        />
      ),
    },
    {
      key: "my",
      label: "마이",
      renderIcon: (active) => (
        <Ionicons
          name={active ? "person" : "person-outline"}
          size={18}
          color={active ? colors.brand[700] : colors.base.text}
        />
      ),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar style="dark" />

      {tab === "explore" ? (
        <GameScreen title="탐험" description="근처 관광지를 탐색하고 반경 도달 시 카드를 수집하세요." />
      ) : null}
      {tab === "collection" ? (
        <GameScreen title="컬렉션" description="방문한 관광지 카드 컬렉션을 확인하세요." />
      ) : null}
      {tab === "my" ? <GameScreen title="마이" description="프로필, 설정, 데이터 동기화 상태를 관리하세요." /> : null}

      <TabBar tabs={tabs} activeKey={tab} onPressTab={(key) => setTab(key as GameTab)} />
    </SafeAreaView>
  );
}

function GameScreen({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x3,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.titleLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  description: {
    fontSize: typography.size.bodyLg,
    lineHeight: typography.lineHeight.bodyLg,
    color: colors.base.textSubtle,
  },
});
