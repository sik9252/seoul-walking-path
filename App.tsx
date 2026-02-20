import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getSessionUser, logoutSession, refreshSession } from "./src/apis/authApi";
import { getApiBaseUrl } from "./src/apis/gameApi";
import { Button, TabBar, TabItem } from "./src/components/ui";
import { useMyCardsQuery, usePlacesQuery, useVisitMutation } from "./src/hooks/useGameData";
import { useNearbyCollectionAlert } from "./src/hooks/useNearbyCollectionAlert";
import { useUserLocation } from "./src/hooks/useUserLocation";
import { AuthScreen } from "./src/screens/AuthScreen";
import { CollectionScreen } from "./src/screens/CollectionScreen";
import { ExploreScreen } from "./src/screens/ExploreScreen";
import { ExploreVisitResultModal } from "./src/screens/widgets/explore";
import { CollectionCategory } from "./src/screens/widgets/collection";
import { AuthSession, clearAuthSession, getAuthSession, setAuthSession } from "./src/storage/authSession";
import { getOnboardingCompleted, setOnboardingCompleted } from "./src/storage/startupFlags";
import { gameStyles as styles } from "./src/styles/gameStyles";
import { GameTab, PlaceItem } from "./src/types/gameTypes";
import { colors } from "./src/theme/tokens";

const queryClient = new QueryClient();
type StartupStep = "splash" | "onboarding" | "auth" | "home";
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
  const [authSession, setAuthSessionState] = React.useState<AuthSession | null>(null);
  const [isRequestingAuthFlow, setIsRequestingAuthFlow] = React.useState(false);
  const [onboardingIndex, setOnboardingIndex] = React.useState(0);
  const [splashProgress, setSplashProgress] = React.useState(0.1);
  const [splashStatus, setSplashStatus] = React.useState("초기 상태를 확인하는 중...");
  const [tab, setTab] = React.useState<GameTab>("explore");
  const [collectionCategory, setCollectionCategory] = React.useState<CollectionCategory>("all");
  const [tabBarHeight, setTabBarHeight] = React.useState(0);
  const [isExploreDetailExpanded, setIsExploreDetailExpanded] = React.useState(false);
  const [selectedPlace, setSelectedPlace] = React.useState<PlaceItem | null>(null);
  const [mapFocusRequest, setMapFocusRequest] = React.useState<{
    id: number;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [visitDialog, setVisitDialog] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });
  const [authRequiredDialogVisible, setAuthRequiredDialogVisible] = React.useState(false);

  const apiBaseUrl = getApiBaseUrl();
  const activeUserId = authSession?.user.id;

  const placesQuery = usePlacesQuery(apiBaseUrl);
  const cardsQuery = useMyCardsQuery(apiBaseUrl, authSession?.user.id);
  const visitMutation = useVisitMutation(apiBaseUrl, authSession?.user.id, {
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
  const collectedPlaceIds = React.useMemo(
    () =>
      (cardsQuery.data ?? [])
        .map((card) => card.place?.id)
        .filter((id): id is string => Boolean(id)),
    [cardsQuery.data],
  );

  useNearbyCollectionAlert({
    places,
    location,
    radiusM: 120,
    enabled: tab === "explore" && Boolean(authSession),
  });

  React.useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    const minSplashMs = 1200;

    const runBootstrap = async () => {
      try {
        const onboardingCompleted = await getOnboardingCompleted();

        setSplashStatus("온보딩 상태를 확인하는 중...");
        setSplashProgress(0.33);

        setSplashStatus("로그인 세션을 확인하는 중...");
        setSplashProgress(0.66);
        const savedSession = await getAuthSession();

        let restoredSession: AuthSession | null = null;
        if (savedSession && apiBaseUrl) {
          try {
            await getSessionUser(apiBaseUrl, savedSession.accessToken);
            restoredSession = savedSession;
          } catch {
            try {
              const refreshed = await refreshSession(apiBaseUrl, savedSession.refreshToken);
              restoredSession = {
                user: refreshed.user,
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
              };
              await setAuthSession(restoredSession);
            } catch {
              await clearAuthSession();
            }
          }
        }

        setAuthSessionState(restoredSession);

        setSplashStatus("앱 진입 준비 중...");
        setSplashProgress(0.9);

        const nextStep: StartupStep = !onboardingCompleted ? "onboarding" : restoredSession ? "home" : "auth";

        const elapsed = Date.now() - startedAt;
        if (elapsed < minSplashMs) {
          await new Promise((resolve) => setTimeout(resolve, minSplashMs - elapsed));
        }

        if (cancelled) return;
        setSplashProgress(1);
        await new Promise((resolve) => setTimeout(resolve, 220));
        if (cancelled) return;
        setStartupStep(nextStep);
      } catch {
        if (cancelled) return;
        setSplashProgress(1);
        await new Promise((resolve) => setTimeout(resolve, 220));
        if (cancelled) return;
        setStartupStep("auth");
      }
    };

    void runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const handleOnboardingNext = React.useCallback(async () => {
    const isLast = onboardingIndex >= ONBOARDING_SLIDES.length - 1;
    if (!isLast) {
      setOnboardingIndex((prev) => prev + 1);
      return;
    }

    setIsRequestingAuthFlow(true);
    try {
      await setOnboardingCompleted(true);
      setStartupStep(authSession ? "home" : "auth");
    } finally {
      setIsRequestingAuthFlow(false);
    }
  }, [authSession, onboardingIndex]);

  const handleReplayTutorial = React.useCallback(() => {
    setOnboardingIndex(0);
    setStartupStep("onboarding");
  }, []);

  const handleAuthenticated = React.useCallback(async (session: AuthSession) => {
    await setAuthSession(session);
    setAuthSessionState(session);
    setStartupStep("home");
  }, []);

  const handleLogout = React.useCallback(async () => {
    if (apiBaseUrl && authSession?.refreshToken) {
      try {
        await logoutSession(apiBaseUrl, authSession.refreshToken);
      } catch {
        // noop
      }
    }
    await clearAuthSession();
    setAuthSessionState(null);
    setStartupStep("auth");
  }, [apiBaseUrl, authSession?.refreshToken]);

  const handleLocatePlaceFromCollection = React.useCallback((place: PlaceItem) => {
    setTab("explore");
    setMapFocusRequest({
      id: Date.now(),
      latitude: place.lat,
      longitude: place.lng,
    });
  }, []);

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
      label: "설정",
      renderIcon: (active) => (
        <Ionicons name={active ? "person" : "person-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
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
            label={isRequestingAuthFlow ? "확인 중..." : isLastSlide ? "시작하기" : "다음"}
            onPress={() => void handleOnboardingNext()}
            disabled={isRequestingAuthFlow}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (startupStep === "auth") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={startupStyles.safe}>
        <StatusBar style="dark" />
        <AuthScreen apiBaseUrl={apiBaseUrl} onAuthenticated={handleAuthenticated} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, display: tab === "explore" ? "flex" : "none" }}>
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
          onCheckVisit={() => {
            if (!authSession) {
              setAuthRequiredDialogVisible(true);
              return;
            }
            visitMutation.mutate();
          }}
          visitDialogVisible={visitDialog.visible}
          visitDialogTitle={visitDialog.title}
          visitDialogMessage={visitDialog.message}
          onCloseVisitDialog={() => setVisitDialog((prev) => ({ ...prev, visible: false }))}
          onOpenDetail={setSelectedPlace}
          onLoadMore={() => void placesQuery.fetchNextPage()}
          bottomOverlayOffset={tabBarHeight}
          onDetailExpandedChange={setIsExploreDetailExpanded}
          collectedPlaceIds={collectedPlaceIds}
          mapFocusRequest={mapFocusRequest}
        />
      </View>

      {tab === "collection" ? (
        <CollectionScreen
          cards={cardsQuery.data ?? []}
          apiBaseUrl={apiBaseUrl}
          userId={activeUserId}
          loadingMyCards={cardsQuery.isPending}
          myCardsError={cardsQuery.isError}
          selectedCategory={collectionCategory}
          onSelectCategory={setCollectionCategory}
          onLocatePlace={handleLocatePlaceFromCollection}
        />
      ) : null}

      {tab === "my" ? (
        <View style={styles.screen}>
          <Text style={styles.title}>설정</Text>
          <Text style={styles.description}>
            {authSession ? `아이디: ${authSession.user.username}` : "로그인이 필요합니다"}
          </Text>
          <Button label="튜토리얼 다시보기" variant="secondary" onPress={handleReplayTutorial} />
          {authSession ? (
            <Button label="로그아웃" variant="secondary" onPress={() => void handleLogout()} />
          ) : (
            <Button label="로그인 / 가입" variant="secondary" onPress={() => setStartupStep("auth")} />
          )}
          <Text style={styles.cardBody}>API: {apiBaseUrl ?? "설정되지 않음"}</Text>
        </View>
      ) : null}

      {!isExploreDetailExpanded ? (
        <TabBar tabs={tabs} activeKey={tab} onPressTab={(key) => setTab(key as GameTab)} onHeightChange={setTabBarHeight} />
      ) : null}

      <ExploreVisitResultModal
        visible={authRequiredDialogVisible}
        title="로그인이 필요해요"
        message="수집 기능은 로그인/가입 후 사용할 수 있어요."
        onClose={() => {
          setAuthRequiredDialogVisible(false);
          setStartupStep("auth");
        }}
      />
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
  footer: {
    gap: 12,
    paddingBottom: 12,
  },
});
