import * as React from "react";
import {
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";

import type {
  LocaleDirection,
  NavigationState,
  Route,
  SceneRendererProps,
} from "./types";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type GetTabWidth = (index: number) => number;

export type Props<T extends Route> = SceneRendererProps & {
  navigationState: NavigationState<T>;
  width: "auto" | `${number}%` | number;
  getTabWidth: GetTabWidth;
  direction: LocaleDirection;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  children?: React.ReactNode;
};

const getTranslateXRange = (
  routes: Route[],
  getTabWidth: GetTabWidth,
  gap?: number,
  width?: number | string
) => {
  const inputRange = routes.map((_, i) => i);

  // every index contains widths at all previous indices
  const outputRange = routes.reduce<number[]>((acc, _, i) => {
    if (typeof width === "number") {
      if (i === 0) return [getTabWidth(i) / 2 - width / 2];

      let sumTabWidth = 0;
      for (let j = 0; j < i; j++) {
        sumTabWidth += getTabWidth(j);
      }

      return [
        ...acc,
        sumTabWidth + getTabWidth(i) / 2 + (gap ? gap * i : 0) - width / 2,
      ];
    } else {
      if (i === 0) return [0];
      return [...acc, (acc as any)[i - 1] + getTabWidth(i - 1) + (gap ?? 0)];
    }
  }, []);

  return { inputRange, outputRange };
};

export function TabBarIndicator<T extends Route>({
  getTabWidth,
  layout,
  navigationState,
  position,
  width,
  direction,
  gap,
  style,
  children,
}: Props<T>) {
  const isIndicatorShown = React.useRef(false);
  const isWidthDynamic = width === "auto";

  const opacity = useSharedValue(isWidthDynamic ? 0 : 1);

  const indicatorVisible = isWidthDynamic
    ? layout.width &&
      navigationState.routes
        .slice(0, navigationState.index)
        .every((_, r) => getTabWidth(r))
    : true;

  React.useEffect(() => {
    const fadeInIndicator = () => {
      if (
        !isIndicatorShown.current &&
        isWidthDynamic &&
        // We should fade-in the indicator when we have widths for all the tab items
        indicatorVisible
      ) {
        isIndicatorShown.current = true;

        opacity.value = withTiming(1, {
          duration: 150,
          easing: Easing.in(Easing.linear),
        });
      }
    };

    fadeInIndicator();

    return () => cancelAnimation(opacity);
  }, [indicatorVisible, isWidthDynamic, opacity]);

  const { routes } = navigationState;

  const { inputRange, outputRange } = getTranslateXRange(
    routes,
    getTabWidth,
    gap,
    width
  );

  // const inputRangeScaleX = routes.map((_, i) => i);
  // const outputRangeScaleX = inputRange.map(getTabWidth);

  // @ts-ignore
  const animatedStyle = useAnimatedStyle(() => {

    const interpolatedTranslateX = interpolate(
      position.value,
      inputRange,
      outputRange,
      "clamp"
    );

    const translateX =
      layout.width > 1
        ? interpolatedTranslateX * (direction === "rtl" ? -1 : 1)
        : 0;


    // const scaleX =
    //   routes.length > 1
    //     ? interpolate(
    //         position.value,
    //         inputRangeScaleX,
    //         outputRangeScaleX,
    //         "clamp"
    //       )
    //     : outputRangeScaleX[0];

    return {
      transform: [
        { translateX },
        // { scaleX },
        // { translateX: direction === "rtl" ? -0.5 : 0.5 },
      ],
    };
  });

  const styleList: StyleProp<ViewStyle> = [];

  styleList.push(
    { width: width === "auto" ? 1 : width },
    { start: `${(100 / routes.length) * navigationState.index}%` },
    animatedStyle
  );

  return (
    <Animated.View
      style={[
        styles.indicator,
        styleList,
        width === "auto" ? { opacity } : null,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: "#ffeb3b",
    position: "absolute",
    start: 0,
    bottom: 0,
    end: 0,
    height: 2,
  },
});
