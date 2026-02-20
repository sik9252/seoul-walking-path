import React from "react";
import { Text, View } from "react-native";
import { useCardCatalogQuery } from "../hooks/useGameData";
import { gameStyles as styles } from "../styles/gameStyles";
import { MyCard, PlaceItem } from "../types/gameTypes";
import {
  CollectionCategory,
  CollectionCategoryItem,
  CollectionCategoryTabs,
  CollectionGrid,
  CollectionHeader,
  CollectionLoadingSkeleton,
  CollectionProgressCard,
} from "./widgets/collection";

type Props = {
  cards: MyCard[];
  apiBaseUrl?: string;
  userId?: string;
  loadingMyCards: boolean;
  myCardsError: boolean;
  selectedCategory: CollectionCategory;
  onSelectCategory: (category: CollectionCategory) => void;
  onLocatePlace: (place: PlaceItem) => void;
};

const DEFAULT_REGIONS = [
  { areaCode: "1", label: "서울" },
  { areaCode: "2", label: "인천" },
  { areaCode: "3", label: "대전" },
  { areaCode: "4", label: "대구" },
  { areaCode: "5", label: "광주" },
  { areaCode: "6", label: "부산" },
  { areaCode: "7", label: "울산" },
  { areaCode: "8", label: "세종" },
  { areaCode: "31", label: "경기" },
  { areaCode: "32", label: "강원" },
  { areaCode: "33", label: "충북" },
  { areaCode: "34", label: "충남" },
  { areaCode: "35", label: "경북" },
  { areaCode: "36", label: "경남" },
  { areaCode: "37", label: "전북" },
  { areaCode: "38", label: "전남" },
  { areaCode: "39", label: "제주" },
];

const REGION_LABELS_BY_CODE: Record<string, string> = Object.fromEntries(
  DEFAULT_REGIONS.map((item) => [item.areaCode, item.label]),
);

export function CollectionScreen({
  cards,
  apiBaseUrl,
  userId,
  loadingMyCards,
  myCardsError,
  selectedCategory,
  onSelectCategory,
  onLocatePlace,
}: Props) {
  const selectedAreaCode = selectedCategory === "all" ? undefined : selectedCategory;
  const selectedRegion = selectedAreaCode ? REGION_LABELS_BY_CODE[selectedAreaCode] : undefined;
  const catalogQuery = useCardCatalogQuery(apiBaseUrl, userId, selectedRegion);
  const catalogItems = React.useMemo(
    () => (catalogQuery.data?.pages ?? []).flatMap((page) => page.items),
    [catalogQuery.data?.pages],
  );

  const availableRegions = React.useMemo<CollectionCategoryItem[]>(
    () =>
      DEFAULT_REGIONS.map((item) => ({
        areaCode: item.areaCode,
        value: item.areaCode,
        label: item.label,
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
        onSelectCategory={onSelectCategory}
      />

      {loading ? <CollectionLoadingSkeleton /> : null}
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
          onLocatePlace={onLocatePlace}
        />
      ) : null}
    </View>
  );
}
