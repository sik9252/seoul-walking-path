import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";

export type CollectionCategory = "all" | string;
export type CollectionCategoryItem = {
  areaCode: string;
  value: string;
  label: string;
};

type CollectionCategoryTabsProps = {
  categories: CollectionCategoryItem[];
  selectedCategory: CollectionCategory;
  onSelectCategory: (category: CollectionCategory) => void;
};

export function CollectionCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CollectionCategoryTabsProps) {
  return (
    <View style={styles.collectionTabsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.collectionTabsScroll}
        contentContainerStyle={styles.collectionTabsRow}
      >
        <Pressable
          key="all"
          onPress={() => onSelectCategory("all")}
          style={[styles.collectionTabChip, selectedCategory === "all" && styles.collectionTabChipActive]}
        >
          <View style={styles.collectionTabChipInner}>
            <Text
              style={[styles.collectionTabChipLabel, selectedCategory === "all" && styles.collectionTabChipLabelActive]}
            >
              전체
            </Text>
          </View>
        </Pressable>

        {categories.map((item) => {
          const active = selectedCategory === item.value;
          return (
            <Pressable
              key={item.areaCode}
              onPress={() => onSelectCategory(item.value)}
              style={[styles.collectionTabChip, active && styles.collectionTabChipActive]}
            >
              <View style={styles.collectionTabChipInner}>
                <Text style={[styles.collectionTabChipLabel, active && styles.collectionTabChipLabelActive]}>
                  {item.label || "지역"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
