import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";
import { colors } from "../../../theme/tokens";

export function CollectionHeader() {
  return (
    <View style={styles.collectionHeader}>
      <Pressable style={styles.collectionHeaderIconBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.base.textSubtle} />
      </Pressable>
      <Text style={styles.collectionHeaderTitle}>나의 컬렉션</Text>
      <Pressable style={styles.collectionHeaderIconBtn}>
        <Ionicons name="ellipsis-vertical" size={22} color={colors.base.textSubtle} />
      </Pressable>
    </View>
  );
}
