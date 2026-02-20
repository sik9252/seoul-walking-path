import React from "react";
import { Text, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";

export function CollectionHeader() {
  return (
    <View style={styles.collectionHeader}>
      <Text style={styles.collectionHeaderTitle}>나의 컬렉션</Text>
    </View>
  );
}
