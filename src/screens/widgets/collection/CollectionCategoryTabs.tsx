import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";

export type CollectionCategory = "all" | "landmark" | "food" | "nature";

type CollectionCategoryTabsProps = {
  selectedCategory: CollectionCategory;
  onSelectCategory: (category: CollectionCategory) => void;
};

const CATEGORY_ITEMS: Array<{
  key: CollectionCategory;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
  { key: "all", label: "All", icon: "grid" },
  { key: "landmark", label: "Landmarks", icon: "business" },
  { key: "food", label: "Food", icon: "restaurant" },
  { key: "nature", label: "Nature", icon: "leaf" },
];

export function CollectionCategoryTabs({ selectedCategory, onSelectCategory }: CollectionCategoryTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionTabsRow}>
      {CATEGORY_ITEMS.map((item) => {
        const active = selectedCategory === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelectCategory(item.key)}
            style={[styles.collectionTabChip, active && styles.collectionTabChipActive]}
          >
            <View style={styles.collectionTabChipInner}>
              <Ionicons
                name={item.icon}
                size={18}
                color={active ? colors.brand[700] : colors.base.textSubtle}
              />
              <Text style={[styles.collectionTabChipLabel, active && styles.collectionTabChipLabelActive]}>
                {item.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
