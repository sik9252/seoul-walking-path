import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";
import { CatalogCardItem, PlaceItem } from "../../../types/gameTypes";

type CollectionGridItem =
  | {
      id: string;
      locked: false;
      card: CatalogCardItem;
    }
  | {
      id: string;
      locked: true;
      title: string;
    };

type CollectionGridProps = {
  items: CollectionGridItem[];
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  onLocatePlace: (place: PlaceItem) => void;
};

const rarityBorderStyleByType = {
  common: styles.collectionCardWrapRarityCommon,
  rare: styles.collectionCardWrapRarityRare,
  epic: styles.collectionCardWrapRarityEpic,
  legendary: styles.collectionCardWrapRarityLegendary,
} as const;

export function CollectionGrid({ items, loading, hasNext, onLoadMore, onLocatePlace }: CollectionGridProps) {
  return (
    <FlatList
      data={items}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.collectionGridRow}
      contentContainerStyle={styles.collectionGridContent}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.45}
      onEndReached={() => {
        if (!loading && hasNext) {
          onLoadMore();
        }
      }}
      renderItem={({ item }) => {
        if (item.locked) {
          return (
            <View style={styles.collectionCardWrap}>
              <View style={[styles.collectionCardImageWrap, styles.collectionCardImageLocked]}>
                <View style={styles.collectionCardLockCircle}>
                  <Ionicons name="lock-closed" size={24} color={colors.base.surface} />
                </View>
              </View>
              <Text numberOfLines={1} style={[styles.collectionCardName, styles.collectionCardNameLocked]}>
                {item.title}
              </Text>
              <Text style={styles.collectionCardStatusLocked}>잠김</Text>
            </View>
          );
        }

        if (!item.card.collected) {
          const lockedImageUrl = item.card.place?.imageUrl ?? item.card.imageUrl ?? null;
          return (
            <View style={styles.collectionCardWrap}>
              <View style={styles.collectionCardImageWrap}>
                {lockedImageUrl ? (
                  <Image source={{ uri: lockedImageUrl }} style={styles.collectionCardImage} />
                ) : (
                  <View style={[styles.collectionCardImageFallback, styles.collectionCardImageLocked]}>
                    <Ionicons name="image-outline" size={26} color={colors.base.surface} />
                  </View>
                )}
                <View style={styles.collectionCardLockOverlay} />
                <View style={styles.collectionCardLockCircle}>
                  <Ionicons name="lock-closed" size={24} color={colors.base.surface} />
                </View>
              </View>
              <Text numberOfLines={1} style={[styles.collectionCardName, styles.collectionCardNameLocked]}>
                {item.card.title}
              </Text>
              <Text style={styles.collectionCardStatusLocked}>잠김</Text>
            </View>
          );
        }

        const { card } = item;
        const imageUrl = card.place?.imageUrl;
        return (
          <View style={[styles.collectionCardWrap, rarityBorderStyleByType[card.rarity]]}>
            <View style={styles.collectionCardImageWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.collectionCardImage} />
              ) : (
                <View style={styles.collectionCardImageFallback}>
                  <Ionicons name="image-outline" size={26} color={colors.base.textSubtle} />
                </View>
              )}
              {card.place ? (
                <Pressable style={styles.collectionRareBadge} onPress={() => onLocatePlace(card.place as PlaceItem)}>
                  <Ionicons name="location" size={18} color={colors.brand[700]} />
                </Pressable>
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.collectionCardName}>
              {card.title}
            </Text>
            <Text style={styles.collectionCardStatus}>수집 완료</Text>
          </View>
        );
      }}
      ListFooterComponent={
        <View style={styles.collectionGridFooter}>
          {loading ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loading && hasNext ? (
            <Pressable style={styles.moreBtn} onPress={onLoadMore}>
              <Text style={styles.moreText}>더 보기</Text>
            </Pressable>
          ) : null}
        </View>
      }
    />
  );
}
