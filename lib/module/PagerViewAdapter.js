"use strict";

import * as React from "react";
import { Keyboard, StyleSheet } from "react-native";
import ViewPager from "react-native-pager-view";
import useLatestCallback from "use-latest-callback";
import Animated, { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { usePageScrollHandler } from "./usePageScrollHandler.js";
import { jsx as _jsx } from "react/jsx-runtime";
const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);
export function PagerViewAdapter({
  keyboardDismissMode = "auto",
  swipeEnabled = true,
  navigationState,
  onIndexChange,
  onTabSelect,
  onSwipeStart,
  onSwipeEnd,
  children,
  style,
  animationEnabled,
  ...rest
}) {
  const {
    index
  } = navigationState;
  const listenersRef = React.useRef([]);
  const pagerRef = React.useRef(null);
  const indexRef = React.useRef(index);
  const navigationStateRef = React.useRef(navigationState);
  const position = useSharedValue(index);
  const offset = useSharedValue(0);
  React.useEffect(() => {
    navigationStateRef.current = navigationState;
  });
  const jumpTo = useLatestCallback(key => {
    const index = navigationStateRef.current.routes.findIndex(route => route.key === key);
    if (animationEnabled) {
      pagerRef.current?.setPage(index);
    } else {
      pagerRef.current?.setPageWithoutAnimation(index);
      position.value = index;
    }
    onIndexChange(index);
  });
  React.useEffect(() => {
    if (keyboardDismissMode === "auto") {
      Keyboard.dismiss();
    }
    if (indexRef.current !== index) {
      if (animationEnabled) {
        pagerRef.current?.setPage(index);
      } else {
        pagerRef.current?.setPageWithoutAnimation(index);
        position.value = index;
      }
    }
  }, [keyboardDismissMode, index, animationEnabled, position]);
  const onPageScrollStateChanged = state => {
    // @ts-ignore
    const {
      pageScrollState
    } = state.nativeEvent;
    switch (pageScrollState) {
      case "idle":
        onSwipeEnd?.();
        return;
      case "dragging":
        {
          // const listenerId = 1;
          // offset.addListener(listenerId, (value) => {
          //   const next =
          //     index + (value > 0 ? Math.ceil(value) : Math.floor(value));

          //   if (next !== index) {
          //     listenersRef.current.forEach((listener) => listener(next));
          //   }

          //   offset.removeListener(listenerId);
          // });

          onSwipeStart?.();
          return;
        }
    }
  };
  const pageScrollHandler = usePageScrollHandler({
    onPageScroll: e => {
      "worklet";

      // @ts-ignore
      if (e.offset === 0) return;

      // @ts-ignore
      offset.value = e.offset;
      // console.log(e.offset, e.position);
    }
  });
  const addEnterListener = useLatestCallback(listener => {
    listenersRef.current.push(listener);
    return () => {
      const index = listenersRef.current.indexOf(listener);
      if (index > -1) {
        listenersRef.current.splice(index, 1);
      }
    };
  });
  const memoizedPosition = useDerivedValue(() => {
    return position.value + offset.value;
  });
  return children({
    position: memoizedPosition,
    addEnterListener,
    jumpTo,
    render: children => /*#__PURE__*/_jsx(AnimatedViewPager, {
      ...rest,
      ref: pagerRef,
      style: [styles.container, style],
      initialPage: index,
      keyboardDismissMode: keyboardDismissMode === "auto" ? "on-drag" : keyboardDismissMode,
      onPageScroll: pageScrollHandler,
      onPageSelected: e => {
        const index = e.nativeEvent.position;
        indexRef.current = index;
        onIndexChange(index);
        onTabSelect?.({
          index
        });
      },
      onPageScrollStateChanged: onPageScrollStateChanged,
      scrollEnabled: swipeEnabled,
      children: children
    })
  });
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=PagerViewAdapter.js.map