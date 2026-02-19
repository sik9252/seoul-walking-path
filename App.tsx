import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabItem } from "./src/components/ui";
import { getApiBaseUrl } from "./src/apis/gameApi";
import { CollectionScreen } from "./src/screens/CollectionScreen";
import { ExploreScreen } from "./src/screens/ExploreScreen";
import { PlaceDetailScreen } from "./src/screens/PlaceDetailScreen";
import { useUserLocation } from "./src/hooks/useUserLocation";
import { useMyCardsQuery, usePlacesQuery, useVisitMutation } from "./src/hooks/useGameData";
import { gameStyles as styles } from "./src/styles/gameStyles";
import { GameTab, PlaceItem } from "./src/types/gameTypes";
import { colors } from "./src/theme/tokens";

const queryClient = new QueryClient();

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

  const placesQuery = usePlacesQuery(apiBaseUrl);
  const cardsQuery = useMyCardsQuery(apiBaseUrl);
  const visitMutation = useVisitMutation(apiBaseUrl);
  const { location, isLoadingLocation, locationError, refreshLocation } = useUserLocation();

  const places = React.useMemo(
    () => (placesQuery.data?.pages ?? []).flatMap((page) => page.items),
    [placesQuery.data?.pages],
  );

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
        <ExploreScreen
          places={places}
          loading={placesQuery.isPending || placesQuery.isFetchingNextPage}
          hasNext={Boolean(placesQuery.hasNextPage)}
          apiEnabled={Boolean(apiBaseUrl)}
          isError={placesQuery.isError}
          userLocation={location}
          isLoadingLocation={isLoadingLocation}
          locationError={locationError}
          onRefreshLocation={() => void refreshLocation()}
          onCheckVisit={() => visitMutation.mutate()}
          onOpenDetail={setSelectedPlace}
          onLoadMore={() => void placesQuery.fetchNextPage()}
        />
      ) : null}

      {tab === "explore" && selectedPlace !== null ? (
        <PlaceDetailScreen place={selectedPlace} onBack={() => setSelectedPlace(null)} />
      ) : null}

      {tab === "collection" ? (
        <CollectionScreen
          cards={cardsQuery.data ?? []}
          loading={cardsQuery.isPending || cardsQuery.isFetching}
          isError={cardsQuery.isError}
        />
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
