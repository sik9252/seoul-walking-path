import React from "react";
import { View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";

export function CollectionLoadingSkeleton() {
  return (
    <View style={styles.collectionSkeletonWrap}>
      <View style={styles.collectionSkeletonGridRow}>
        <View style={styles.collectionSkeletonCard} />
        <View style={styles.collectionSkeletonCard} />
      </View>
      <View style={styles.collectionSkeletonGridRow}>
        <View style={styles.collectionSkeletonCard} />
        <View style={styles.collectionSkeletonCard} />
      </View>
    </View>
  );
}
