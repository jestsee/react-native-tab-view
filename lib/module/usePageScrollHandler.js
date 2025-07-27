"use strict";

import { useEvent, useHandler } from "react-native-reanimated";
export function usePageScrollHandler(handlers, dependencies) {
  const {
    context,
    doDependenciesDiffer
  } = useHandler(handlers, dependencies);
  const subscribeForEvents = ["onPageScroll"];
  return useEvent(event => {
    "worklet";

    const {
      onPageScroll
    } = handlers;
    if (onPageScroll && event.eventName.endsWith("onPageScroll")) {
      onPageScroll(event, context);
    }
  }, subscribeForEvents, doDependenciesDiffer);
}
//# sourceMappingURL=usePageScrollHandler.js.map