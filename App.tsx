import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  imageUrl?: string | null;
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

type VisitCheckResponse = {
  matched?: boolean;
  collected?: boolean;
  place?: PlaceItem;
  card?: { title?: string };
  reason?: string;
};

const DEMO_USER_ID = "demo-user";
const DEMO_LAT = 37.579617;
const DEMO_LNG = 126.977041;
const PAGE_SIZE = 20;

const queryClient = new QueryClient();

function getApiBaseUrl() {
  const platformBaseUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_BASE_URL_IOS;
  const base = platformBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;
  return base?.endsWith("/") ? base.slice(0, -1) : base;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`request_failed_${response.status}`);
  }
  return (await response.json()) as T;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [tab, setTab] = React.useState<GameTab>("explore");
  const [selectedPlace, setSelectedPlace] = React.useState<PlaceItem | null>(null);
  const apiBaseUrl = getApiBaseUrl();
  const query = useQueryClient();
  const apiEnabled = Boolean(apiBaseUrl);

  const placesQuery = useInfiniteQuery({
    queryKey: ["places", apiBaseUrl, DEMO_LAT, DEMO_LNG, PAGE_SIZE],
    enabled: apiEnabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchJson<PlacePage>(
        `${apiBaseUrl}/places?lat=${DEMO_LAT}&lng=${DEMO_LNG}&radius=3000&page=${pageParam}&pageSize=${PAGE_SIZE}`,
      ),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });

  const cardsQuery = useQuery({
    queryKey: ["cards", "my", apiBaseUrl, DEMO_USER_ID],
    enabled: apiEnabled,
    queryFn: () => fetchJson<MyCard[]>(`${apiBaseUrl}/cards/my?userId=${DEMO_USER_ID}`),
  });

  const visitMutation = useMutation({
    mutationFn: () =>
      fetchJson<VisitCheckResponse>(`${apiBaseUrl}/visits/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          lat: DEMO_LAT,
          lng: DEMO_LNG,
          radiusM: 50,
        }),
      }),
    onSuccess: (payload) => {
      if (!payload.matched) {
        Alert.alert("방문 실패", "반경 내 관광지가 없어요.");
        return;
      }
      if (payload.collected) {
        Alert.alert("카드 획득", `${payload.place?.name ?? "관광지"} 카드를 획득했어요.`);
      } else {
        Alert.alert("이미 수집됨", `${payload.place?.name ?? "관광지"}는 이미 수집한 장소예요.`);
      }
      void query.invalidateQueries({ queryKey: ["cards", "my", apiBaseUrl, DEMO_USER_ID] });
    },
    onError: (error) => {
      console.warn("[app] checkVisit failed", error);
      Alert.alert("오류", "방문 판정 중 문제가 발생했어요.");
    },
  });

  const places = React.useMemo(
    () => (placesQuery.data?.pages ?? []).flatMap((page) => page.items),
    [placesQuery.data?.pages],
  );
  const hasNextPlaces = Boolean(placesQuery.hasNextPage);
  const loadingPlaces = placesQuery.isPending || placesQuery.isFetchingNextPage;
  const loadingCards = cardsQuery.isPending || cardsQuery.isFetching;
  const cards = cardsQuery.data ?? [];

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

      {tab === "explore" && selectedPlace === null ? (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.screen}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!loadingPlaces && hasNextPlaces) {
              void placesQuery.fetchNextPage();
            }
          }}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.title}>탐험</Text>
              <Text style={styles.description}>근처 관광지에 도달해 카드를 수집하세요.</Text>
              <Button label="현재 위치 방문 판정 (데모)" onPress={() => visitMutation.mutate()} />
              {!apiEnabled ? <Text style={styles.errorText}>API URL이 설정되지 않았습니다.</Text> : null}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedPlace(item)}>
              <Card>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardBody}>
                  {item.category} · {item.address}
                </Text>
              </Card>
            </Pressable>
          )}
          ListFooterComponent={
            <View style={styles.listFooter}>
              {loadingPlaces ? <ActivityIndicator color={colors.brand[600]} /> : null}
              {!loadingPlaces && hasNextPlaces ? (
                <Pressable style={styles.moreBtn} onPress={() => void placesQuery.fetchNextPage()}>
                  <Text style={styles.moreText}>더 보기</Text>
                </Pressable>
              ) : null}
              {!loadingPlaces && !hasNextPlaces && places.length > 0 ? (
                <Text style={styles.endText}>모든 관광지를 불러왔어요.</Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={!loadingPlaces ? <Text style={styles.cardBody}>관광지 데이터가 없습니다.</Text> : null}
        />
      ) : null}

      {tab === "explore" && selectedPlace !== null ? (
        <ScrollView contentContainerStyle={styles.screen}>
          <Pressable style={styles.backBtn} onPress={() => setSelectedPlace(null)}>
            <Ionicons name="arrow-back" size={18} color={colors.base.text} />
            <Text style={styles.backText}>목록으로</Text>
          </Pressable>

          <Text style={styles.title}>{selectedPlace.name}</Text>
          <Text style={styles.description}>{selectedPlace.category}</Text>

          {selectedPlace.imageUrl ? (
            <Image source={{ uri: selectedPlace.imageUrl }} style={styles.placeImage} resizeMode="cover" />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="image-outline" size={22} color={colors.base.textSubtle} />
              <Text style={styles.cardBody}>이미지가 없습니다.</Text>
            </View>
          )}

          <Card>
            <Text style={styles.detailLabel}>주소</Text>
            <Text style={styles.cardBody}>{selectedPlace.address || "주소 정보 없음"}</Text>
          </Card>

          <Card>
            <Text style={styles.detailLabel}>위치 좌표</Text>
            <Text style={styles.cardBody}>
              위도 {selectedPlace.lat.toFixed(6)} / 경도 {selectedPlace.lng.toFixed(6)}
            </Text>
          </Card>

          <Card>
            <Text style={styles.detailLabel}>설명</Text>
            <Text style={styles.cardBody}>
              {selectedPlace.name}는 {selectedPlace.category} 카테고리 관광지입니다. 방문 반경 안에 들어오면 카드 수집이 가능합니다.
            </Text>
          </Card>
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
  listHeader: {
    gap: spacing.md,
  },
  listFooter: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  endText: {
    textAlign: "center",
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  backText: {
    color: colors.base.text,
    fontSize: typography.size.bodySm,
    fontWeight: typography.weight.medium,
  },
  placeImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.base.surface,
  },
  imageFallback: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.base.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.base.text,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
    fontSize: typography.size.bodySm,
  },
  errorText: {
    color: "#B42318",
    fontSize: typography.size.bodySm,
  },
});
