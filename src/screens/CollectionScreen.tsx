import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "../theme/tokens";
import { gameStyles as styles } from "../styles/gameStyles";
import { MyCard } from "../types/gameTypes";
import {
  CollectionCategory,
  CollectionCategoryTabs,
  CollectionGrid,
  CollectionHeader,
  CollectionProgressCard,
} from "./widgets/collection";

type Props = {
  cards: MyCard[];
  loading: boolean;
  isError: boolean;
};

export function CollectionScreen({ cards, loading, isError }: Props) {
  const [selectedCategory, setSelectedCategory] = React.useState<CollectionCategory>("all");

  const availableRegions = React.useMemo(() => {
    const regionSet = new Set<string>();
    cards.forEach((card) => {
      const region = card.place?.region?.trim();
      if (region) {
        regionSet.add(region);
      }
    });
    return [...regionSet].sort((a, b) => a.localeCompare(b, "ko"));
  }, [cards]);

  const filteredCards = React.useMemo(() => {
    if (selectedCategory === "all") return cards;
    return cards.filter((card) => (card.place?.region ?? "").trim() === selectedCategory);
  }, [cards, selectedCategory]);

  const gridItems = React.useMemo(() => {
    const collectedItems = filteredCards.map((card) => ({
      id: card.cardId,
      locked: false as const,
      card,
    }));

    const lockedCount = Math.max(0, 8 - collectedItems.length);
    const lockedItems = Array.from({ length: lockedCount }, (_, index) => ({
      id: `locked-${selectedCategory}-${index + 1}`,
      locked: true as const,
      title: `Unknown Spot ${index + 1}`,
    }));

    return [...collectedItems, ...lockedItems];
  }, [filteredCards, selectedCategory]);

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
      {!loading && !isError ? <CollectionGrid items={gridItems} /> : null}
    </View>
  );
}
