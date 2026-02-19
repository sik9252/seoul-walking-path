import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button, TabBar, TabItem } from "./src/components/ui";
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
type StartupStep = "splash" | "onboarding" | "permission" | "home";

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
  const [startupStep, setStartupStep] = React.useState<StartupStep>("splash");
  const [isRequestingPermission, setIsRequestingPermission] = React.useState(false);
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
  const { location, isLoadingLocation, locationError, refreshLocation, refreshLocationWithOptions, getPermissionStatus, clearLocationError } =
    useUserLocation();

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStartupStep("onboarding");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handlePermissionRequest = React.useCallback(async () => {
    setIsRequestingPermission(true);
    const result = await refreshLocation();
    if (result.ok) {
      clearLocationError();
      setStartupStep("home");
      setIsRequestingPermission(false);
      return;
    }
    setIsRequestingPermission(false);
  }, [clearLocationError, refreshLocation]);

  const handleOnboardingNext = React.useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const permissionStatus = await getPermissionStatus();
      if (permissionStatus === "granted") {
        await refreshLocationWithOptions({ requestIfNeeded: false });
        clearLocationError();
        setStartupStep("home");
        return;
      }
      setStartupStep("permission");
    } finally {
      setIsRequestingPermission(false);
    }
  }, [clearLocationError, getPermissionStatus, refreshLocationWithOptions]);

  const handleContinueWithoutPermission = React.useCallback(() => {
    clearLocationError();
    setStartupStep("home");
  }, [clearLocationError]);

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

  if (startupStep === "splash") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={startupStyles.safe}>
        <StatusBar style="dark" />
        <View style={startupStyles.center}>
          <Image source={require("./assets/seoul_walking_path_logo.png")} style={startupStyles.splashLogo} />
          <Text style={startupStyles.splashTitle}>서울걷길</Text>
          <Text style={startupStyles.splashBody}>스팟을 수집하며 도시를 탐험해보세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (startupStep === "onboarding") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={startupStyles.safe}>
        <StatusBar style="dark" />
        <View style={startupStyles.center}>
          <Image source={require("./assets/seoul_walking_path_logo.png")} style={startupStyles.onboardingLogo} />
          <Text style={startupStyles.onboardingTitle}>서울걷길에 오신 것을 환영해요</Text>
          <Text style={startupStyles.onboardingBody}>
            지도에서 관광지 스팟을 찾고 가까이 도달하면 카드를 수집할 수 있어요.
          </Text>
        </View>
        <View style={startupStyles.footer}>
          <Button
            label={isRequestingPermission ? "확인 중..." : "다음"}
            onPress={() => void handleOnboardingNext()}
            disabled={isRequestingPermission}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (startupStep === "permission") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={startupStyles.safe}>
        <StatusBar style="dark" />
        <View style={startupStyles.center}>
          <Ionicons name="location-outline" size={48} color={colors.brand[700]} />
          <Text style={startupStyles.onboardingTitle}>위치 권한 안내</Text>
          <Text style={startupStyles.onboardingBody}>
            현재 위치를 기반으로 주변 스팟을 정확하게 보여주기 위해 위치 권한이 필요합니다.
          </Text>
          {locationError ? <Text style={startupStyles.permissionError}>{locationError}</Text> : null}
        </View>
        <View style={startupStyles.footer}>
          <Button
            label={isRequestingPermission ? "권한 확인 중..." : "위치 권한 허용하고 시작"}
            onPress={() => void handlePermissionRequest()}
            disabled={isRequestingPermission}
          />
          <Button
            label="나중에 하기"
            variant="secondary"
            onPress={handleContinueWithoutPermission}
            disabled={isRequestingPermission}
            style={startupStyles.secondaryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
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
          apiBaseUrl={apiBaseUrl}
          loadingMyCards={cardsQuery.isPending || cardsQuery.isFetching}
          myCardsError={cardsQuery.isError}
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

const startupStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  splashLogo: {
    width: 160,
    height: 160,
    borderRadius: 32,
  },
  onboardingLogo: {
    width: 220,
    height: 220,
    borderRadius: 36,
  },
  splashTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.base.text,
  },
  splashBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.base.textSubtle,
    textAlign: "center",
  },
  onboardingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.base.text,
    textAlign: "center",
  },
  onboardingBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.base.textSubtle,
    textAlign: "center",
  },
  permissionError: {
    marginTop: 8,
    fontSize: 14,
    color: colors.semantic.error,
    textAlign: "center",
  },
  footer: {
    gap: 12,
    paddingBottom: 12,
  },
  secondaryButton: {
    borderColor: colors.base.border,
  },
});
