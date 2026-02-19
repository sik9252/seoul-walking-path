import React from "react";
import { Animated, Easing, PanResponder } from "react-native";

type Params = {
  visible: boolean;
  collapsedOffset: number;
};

export function useBottomSheetSnap({ visible, collapsedOffset }: Params) {
  const translateY = React.useRef(new Animated.Value(collapsedOffset)).current;
  const [expanded, setExpanded] = React.useState(false);
  const expandedRef = React.useRef(false);
  const collapsedOffsetRef = React.useRef(collapsedOffset);
  const dragStartYRef = React.useRef(collapsedOffset);

  React.useEffect(() => {
    collapsedOffsetRef.current = collapsedOffset;
  }, [collapsedOffset]);

  const animateTo = React.useCallback(
    (toValue: number) => {
      Animated.timing(translateY, {
        toValue,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
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

  const reset = React.useCallback(() => {
    expandedRef.current = false;
    setExpanded(false);
    translateY.stopAnimation(() => {
      translateY.setValue(collapsedOffsetRef.current);
    });
  }, [translateY]);

  React.useEffect(() => {
    if (!visible) {
      reset();
      return;
    }
    setExpandedState(false);
  }, [reset, setExpandedState, visible]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation((value: number) => {
            dragStartYRef.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, Math.min(collapsedOffset, dragStartYRef.current + gesture.dy));
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const currentY = Math.max(0, Math.min(collapsedOffset, dragStartYRef.current + gesture.dy));
          const fastSwipeUp = gesture.vy < -0.35;
          const fastSwipeDown = gesture.vy > 0.35;
          const halfPoint = collapsedOffset * 0.5;

          if (fastSwipeUp) {
            setExpandedState(true);
            return;
          }
          if (fastSwipeDown) {
            setExpandedState(false);
            return;
          }

          setExpandedState(currentY <= halfPoint);
        },
      }),
    [collapsedOffset, setExpandedState, translateY],
  );

  return {
    expanded,
    translateY,
    setExpandedState,
    reset,
    panHandlers: panResponder.panHandlers,
  };
}
