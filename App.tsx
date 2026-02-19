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
import { useUserLocation } from "./src/hooks/useUserLocation";
import { useNearbyCollectionAlert } from "./src/hooks/useNearbyCollectionAlert";
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
  const [visitDialog, setVisitDialog] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });
  const apiBaseUrl = getApiBaseUrl();

  const placesQuery = usePlacesQuery(apiBaseUrl);
  const cardsQuery = useMyCardsQuery(apiBaseUrl);
  const visitMutation = useVisitMutation(apiBaseUrl, {
    onOpenDialog: ({ title, message }) =>
      setVisitDialog({
        visible: true,
        title,
        message,
      }),
  });
  const { location, isLoadingLocation, locationError, refreshLocation } = useUserLocation();

  const places = React.useMemo(
    () => (placesQuery.data?.pages ?? []).flatMap((page) => page.items),
    [placesQuery.data?.pages],
  );

  useNearbyCollectionAlert({
    places,
    location,
    radiusM: 120,
    enabled: tab === "explore",
  });

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

      {tab === "explore" && selectedPlace === null ? (
        <ExploreScreen
          places={places}
          loading={placesQuery.isPending || placesQuery.isFetchingNextPage}
          hasNext={Boolean(placesQuery.hasNextPage)}
          apiBaseUrl={apiBaseUrl}
          isError={placesQuery.isError}
          userLocation={location}
          isLoadingLocation={isLoadingLocation}
          locationError={locationError}
          onRefreshLocation={refreshLocation}
          onCheckVisit={() => visitMutation.mutate()}
          visitDialogVisible={visitDialog.visible}
          visitDialogTitle={visitDialog.title}
          visitDialogMessage={visitDialog.message}
          onCloseVisitDialog={() => setVisitDialog((prev) => ({ ...prev, visible: false }))}
          onOpenDetail={setSelectedPlace}
          onLoadMore={() => void placesQuery.fetchNextPage()}
        />
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
