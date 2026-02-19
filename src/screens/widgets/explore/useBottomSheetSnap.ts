import React from "react";
import { Animated, PanResponder } from "react-native";

type Params = {
  visible: boolean;
  collapsedOffset: number;
};

export function useBottomSheetSnap({ visible, collapsedOffset }: Params) {
  const translateY = React.useRef(new Animated.Value(collapsedOffset)).current;
  const [expanded, setExpanded] = React.useState(false);
  const expandedRef = React.useRef(false);

  const animateTo = React.useCallback(
    (toValue: number) => {
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }).start();
    },
    [translateY],
  );

  const setExpandedState = React.useCallback(
    (next: boolean) => {
      expandedRef.current = next;
      setExpanded(next);
      animateTo(next ? 0 : collapsedOffset);
    },
    [animateTo, collapsedOffset],
  );

  React.useEffect(() => {
    if (!visible) return;
    setExpandedState(false);
  }, [setExpandedState, visible]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          const base = expandedRef.current ? 0 : collapsedOffset;
          const next = Math.max(0, Math.min(collapsedOffset, base + gesture.dy));
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldExpand = gesture.dy < -24;
          const shouldCollapse = gesture.dy > 24;
          if (shouldExpand) {
            setExpandedState(true);
            return;
          }
          if (shouldCollapse) {
            setExpandedState(false);
            return;
          }
          setExpandedState(expandedRef.current);
        },
      }),
    [collapsedOffset, setExpandedState, translateY],
  );

  return {
    expanded,
    translateY,
    setExpandedState,
    panHandlers: panResponder.panHandlers,
  };
}
