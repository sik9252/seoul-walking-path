import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useCardCatalogQuery } from "../hooks/useGameData";
import { colors } from "../theme/tokens";
import { gameStyles as styles } from "../styles/gameStyles";
import { MyCard } from "../types/gameTypes";
import {
  CollectionCategory,
  CollectionCategoryItem,
  CollectionCategoryTabs,
  CollectionGrid,
  CollectionHeader,
  CollectionProgressCard,
} from "./widgets/collection";

type Props = {
  cards: MyCard[];
  apiBaseUrl?: string;
  loadingMyCards: boolean;
  myCardsError: boolean;
};

const DEFAULT_REGIONS = [
  "서울",
  "인천",
  "대전",
  "대구",
  "광주",
  "부산",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "경북",
  "경남",
  "전북",
  "전남",
  "제주",
];

const REGION_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_REGIONS.map((name) => [name, name]),
);

export function CollectionScreen({ cards, apiBaseUrl, loadingMyCards, myCardsError }: Props) {
  const [selectedCategory, setSelectedCategory] = React.useState<CollectionCategory>("all");

  const selectedRegion = selectedCategory === "all" ? undefined : selectedCategory;
  const catalogQuery = useCardCatalogQuery(apiBaseUrl, selectedRegion);
  const catalogItems = React.useMemo(
    () => (catalogQuery.data?.pages ?? []).flatMap((page) => page.items),
    [catalogQuery.data?.pages],
  );

  const availableRegions = React.useMemo<CollectionCategoryItem[]>(
    () =>
      DEFAULT_REGIONS.map((region) => ({
        value: region,
        label: REGION_LABELS[region] ?? region,
      })),
    [],
  );

  const gridItems = React.useMemo(() => {
    const items = catalogItems.map((card) => ({
      id: card.cardId,
      locked: false as const,
      card,
    }));
    const lockedCount = Math.max(0, 8 - items.length);
    const lockedItems = Array.from({ length: lockedCount }, (_, index) => ({
      id: `locked-${selectedCategory}-${index + 1}`,
      locked: true as const,
      title: `Unknown Spot ${index + 1}`,
    }));
    return [...items, ...lockedItems];
  }, [catalogItems, selectedCategory]);

  const loading = loadingMyCards || catalogQuery.isPending;
  const isError = myCardsError || catalogQuery.isError;

  return (
    <View style={styles.collectionScreen}>
      <CollectionHeader />
      <CollectionProgressCard collectedCount={cards.length} totalCount={50} />
      <CollectionCategoryTabs
        categories={availableRegions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loading ? (
        <View style={styles.collectionStateBox}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      ) : null}
      {isError ? (
        <View style={styles.collectionStateBox}>
          <Text style={styles.errorText}>카드 목록을 불러오지 못했습니다.</Text>
        </View>
      ) : null}
      {!loading && !isError ? (
        <CollectionGrid
          items={gridItems}
          loading={catalogQuery.isFetchingNextPage}
          hasNext={Boolean(catalogQuery.hasNextPage)}
          onLoadMore={() => void catalogQuery.fetchNextPage()}
        />
      ) : null}
    </View>
  );
}
