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
import { getOnboardingCompleted, setOnboardingCompleted } from "./src/storage/startupFlags";
import { gameStyles as styles } from "./src/styles/gameStyles";
import { GameTab, PlaceItem } from "./src/types/gameTypes";
import { colors } from "./src/theme/tokens";

const queryClient = new QueryClient();
type StartupStep = "splash" | "onboarding" | "permission" | "home";
type OnboardingSlide = {
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "스팟 탐험",
    body: "지도에서 주변 관광지 스팟을 찾고 원하는 지역으로 이동해 탐험하세요.",
    icon: "map-outline",
  },
  {
    title: "현장 방문 수집",
    body: "스팟 반경에 도달하면 해당 관광지 카드를 수집할 수 있어요.",
    icon: "navigate-outline",
  },
  {
    title: "컬렉션 완성",
    body: "서울, 부산, 제주 등 지역별 컬렉션을 모아 나만의 도감을 완성해보세요.",
    icon: "albums-outline",
  },
];

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
  const [onboardingIndex, setOnboardingIndex] = React.useState(0);
  const [splashProgress, setSplashProgress] = React.useState(0.1);
  const [splashStatus, setSplashStatus] = React.useState("환경을 확인하고 있어요...");
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
    let cancelled = false;
    const startedAt = Date.now();
    const minSplashMs = 1200;
    const progressTimer = setInterval(() => {
      setSplashProgress((prev) => Math.min(0.92, prev + 0.04));
    }, 150);

    const runBootstrap = async () => {
      try {
        setSplashStatus("온보딩 상태를 확인하는 중...");
        const onboardingCompleted = await getOnboardingCompleted();

        setSplashStatus("권한 상태를 확인하는 중...");
        const permissionStatus = await getPermissionStatus();

        let nextStep: StartupStep;
        if (!onboardingCompleted) {
          nextStep = "onboarding";
        } else if (permissionStatus === "granted") {
          setSplashStatus("위치 정보를 준비하는 중...");
          await refreshLocationWithOptions({ requestIfNeeded: false });
          nextStep = "home";
        } else {
          nextStep = "permission";
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed < minSplashMs) {
          await new Promise((resolve) => setTimeout(resolve, minSplashMs - elapsed));
        }
        if (cancelled) return;
        setSplashProgress(1);
        setStartupStep(nextStep);
      } catch {
        if (cancelled) return;
        setStartupStep("onboarding");
      } finally {
        clearInterval(progressTimer);
      }
    };

    void runBootstrap();

    return () => {
      cancelled = true;
      clearInterval(progressTimer);
    };
  }, [getPermissionStatus, refreshLocationWithOptions]);

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
    const isLast = onboardingIndex >= ONBOARDING_SLIDES.length - 1;
    if (!isLast) {
      setOnboardingIndex((prev) => prev + 1);
      return;
    }

    setIsRequestingPermission(true);
    try {
      await setOnboardingCompleted(true);
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
  }, [clearLocationError, getPermissionStatus, onboardingIndex, refreshLocationWithOptions]);

  const handleContinueWithoutPermission = React.useCallback(() => {
    clearLocationError();
    setStartupStep("home");
  }, [clearLocationError]);

  const handleReplayTutorial = React.useCallback(() => {
    setOnboardingIndex(0);
    clearLocationError();
    setStartupStep("onboarding");
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
          <Text style={startupStyles.splashBody}>{splashStatus}</Text>
          <View style={startupStyles.splashProgressTrack}>
            <View style={[startupStyles.splashProgressFill, { width: `${Math.round(splashProgress * 100)}%` }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (startupStep === "onboarding") {
    const currentSlide = ONBOARDING_SLIDES[onboardingIndex] ?? ONBOARDING_SLIDES[0];
    const isLastSlide = onboardingIndex >= ONBOARDING_SLIDES.length - 1;
    return (
      <SafeAreaView edges={["top", "bottom"]} style={startupStyles.safe}>
        <StatusBar style="dark" />
        <View style={startupStyles.center}>
          <Image source={require("./assets/seoul_walking_path_logo.png")} style={startupStyles.onboardingLogo} />
          <View style={startupStyles.onboardingBadge}>
            <Ionicons name={currentSlide.icon} size={22} color={colors.brand[700]} />
            <Text style={startupStyles.onboardingStepLabel}>
              {onboardingIndex + 1} / {ONBOARDING_SLIDES.length}
            </Text>
          </View>
          <Text style={startupStyles.onboardingTitle}>{currentSlide.title}</Text>
          <Text style={startupStyles.onboardingBody}>{currentSlide.body}</Text>
        </View>
        <View style={startupStyles.footer}>
          <Button
            label={isRequestingPermission ? "확인 중..." : isLastSlide ? "시작하기" : "다음"}
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
          <Button label="튜토리얼 다시보기" variant="secondary" onPress={handleReplayTutorial} />
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
  splashProgressTrack: {
    width: "86%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 4,
  },
  splashProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.brand[500],
  },
  onboardingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[100],
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  onboardingStepLabel: {
    fontSize: 13,
    color: colors.brand[700],
    fontWeight: "700",
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
