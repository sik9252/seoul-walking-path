import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, TabBar, TabItem } from "./src/components/ui";
import { colors, spacing, typography } from "./src/theme/tokens";

type GameTab = "explore" | "collection" | "my";

type PlaceItem = {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
};

type PlacePage = {
  items: PlaceItem[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
};

type MyCard = {
  cardId: string;
  title: string;
  rarity: "common" | "rare" | "epic";
  place: PlaceItem | null;
};

const DEMO_USER_ID = "demo-user";
const DEMO_LAT = 37.579617;
const DEMO_LNG = 126.977041;

function getApiBaseUrl() {
  const platformBaseUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_BASE_URL_IOS;
  const base = platformBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;
  return base?.endsWith("/") ? base.slice(0, -1) : base;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [tab, setTab] = React.useState<GameTab>("explore");
  const [places, setPlaces] = React.useState<PlaceItem[]>([]);
  const [placePage, setPlacePage] = React.useState(1);
  const [hasNextPlaces, setHasNextPlaces] = React.useState(false);
  const [loadingPlaces, setLoadingPlaces] = React.useState(false);
  const [cards, setCards] = React.useState<MyCard[]>([]);
  const [loadingCards, setLoadingCards] = React.useState(false);

  const apiBaseUrl = getApiBaseUrl();

  const loadPlaces = React.useCallback(
    async (page: number, append: boolean) => {
      if (!apiBaseUrl) return;
      setLoadingPlaces(true);
      try {
        const response = await fetch(
          `${apiBaseUrl}/places?lat=${DEMO_LAT}&lng=${DEMO_LNG}&radius=3000&page=${page}&pageSize=20`,
        );
        if (!response.ok) {
          throw new Error(`places_failed_${response.status}`);
        }
        const payload = (await response.json()) as PlacePage;
        setPlaces((prev) => (append ? [...prev, ...payload.items] : payload.items));
        setPlacePage(payload.page);
        setHasNextPlaces(payload.hasNext);
      } catch (error) {
        console.warn("[app] loadPlaces failed", error);
      } finally {
        setLoadingPlaces(false);
      }
    },
    [apiBaseUrl],
  );

  const loadMyCards = React.useCallback(async () => {
    if (!apiBaseUrl) return;
    setLoadingCards(true);
    try {
      const response = await fetch(`${apiBaseUrl}/cards/my?userId=${DEMO_USER_ID}`);
      if (!response.ok) throw new Error(`cards_failed_${response.status}`);
      const payload = (await response.json()) as MyCard[];
      setCards(payload);
    } catch (error) {
      console.warn("[app] loadMyCards failed", error);
    } finally {
      setLoadingCards(false);
    }
  }, [apiBaseUrl]);

  React.useEffect(() => {
    if (!apiBaseUrl) return;
    void loadPlaces(1, false);
    void loadMyCards();
  }, [apiBaseUrl, loadMyCards, loadPlaces]);

  const checkVisit = React.useCallback(async () => {
    if (!apiBaseUrl) return;
    try {
      const response = await fetch(`${apiBaseUrl}/visits/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          lat: DEMO_LAT,
          lng: DEMO_LNG,
          radiusM: 50,
        }),
      });
      if (!response.ok) throw new Error(`visit_failed_${response.status}`);
      const payload = (await response.json()) as {
        matched?: boolean;
        collected?: boolean;
        place?: PlaceItem;
        card?: { title?: string };
        reason?: string;
      };

      if (!payload.matched) {
        Alert.alert("방문 실패", "반경 내 관광지가 없어요.");
        return;
      }
      if (payload.collected) {
        Alert.alert("카드 획득", `${payload.place?.name ?? "관광지"} 카드를 획득했어요.`);
      } else {
        Alert.alert("이미 수집됨", `${payload.place?.name ?? "관광지"}는 이미 수집한 장소예요.`);
      }
      void loadMyCards();
    } catch (error) {
      console.warn("[app] checkVisit failed", error);
      Alert.alert("오류", "방문 판정 중 문제가 발생했어요.");
    }
  }, [apiBaseUrl, loadMyCards]);

  const tabs: TabItem[] = [
    {
      key: "explore",
      label: "탐험",
      renderIcon: (active) => (
        <Ionicons name={active ? "compass" : "compass-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
    {
      key: "collection",
      label: "컬렉션",
      renderIcon: (active) => (
        <Ionicons name={active ? "albums" : "albums-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
    {
      key: "my",
      label: "마이",
      renderIcon: (active) => (
        <Ionicons name={active ? "person" : "person-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar style="dark" />

      {tab === "explore" ? (
        <ScrollView contentContainerStyle={styles.screen}>
          <Text style={styles.title}>탐험</Text>
          <Text style={styles.description}>근처 관광지에 도달해 카드를 수집하세요.</Text>

          <Button label="현재 위치 방문 판정 (데모)" onPress={checkVisit} />

          {places.map((place) => (
            <Card key={place.id}>
              <Text style={styles.cardTitle}>{place.name}</Text>
              <Text style={styles.cardBody}>{place.category} · {place.address}</Text>
            </Card>
          ))}

          {loadingPlaces ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {hasNextPlaces ? (
            <Pressable style={styles.moreBtn} onPress={() => void loadPlaces(placePage + 1, true)}>
              <Text style={styles.moreText}>더 보기</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      ) : null}

      {tab === "collection" ? (
        <ScrollView contentContainerStyle={styles.screen}>
          <Text style={styles.title}>컬렉션</Text>
          <Text style={styles.description}>획득한 관광지 카드를 모아보세요.</Text>

          {loadingCards ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loadingCards && cards.length === 0 ? <Text style={styles.cardBody}>아직 획득한 카드가 없어요.</Text> : null}

          {cards.map((card) => (
            <Card key={card.cardId}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.rarity.toUpperCase()} · {card.place?.name ?? "알 수 없는 장소"}</Text>
            </Card>
          ))}
        </ScrollView>
      ) : null}

      {tab === "my" ? (
        <View style={styles.screen}>
          <Text style={styles.title}>마이</Text>
          <Text style={styles.description}>계정/설정은 다음 단계에서 연결합니다.</Text>
          <Text style={styles.cardBody}>API: {apiBaseUrl ?? "설정되지 않음"}</Text>
        </View>
      ) : null}

      <TabBar tabs={tabs} activeKey={tab} onPressTab={(key) => setTab(key as GameTab)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x2,
    paddingBottom: 110,
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
  cardTitle: {
    fontSize: typography.size.labelLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  cardBody: {
    fontSize: typography.size.bodySm,
    color: colors.base.textSubtle,
  },
  moreBtn: {
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  moreText: {
    color: colors.brand[700],
    fontWeight: typography.weight.semibold,
  },
});
