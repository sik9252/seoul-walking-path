import React from "react";
import { Animated, Easing, View } from "react-native";
import { gameStyles as styles } from "../../../styles/gameStyles";

export function CollectionLoadingSkeleton() {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 240],
  });

  const renderSkeletonCard = (key: string) => (
    <View key={key} style={styles.collectionSkeletonCard}>
      <Animated.View
        style={[
          styles.collectionSkeletonCardShimmer,
          {
            transform: [{ translateX: shimmerTranslateX }],
          },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.collectionSkeletonWrap}>
      <View style={styles.collectionSkeletonGridRow}>
        {renderSkeletonCard("skeleton-1")}
        {renderSkeletonCard("skeleton-2")}
      </View>
      <View style={styles.collectionSkeletonGridRow}>
        {renderSkeletonCard("skeleton-3")}
        {renderSkeletonCard("skeleton-4")}
      </View>
    </View>
  );
}
