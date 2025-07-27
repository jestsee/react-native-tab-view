import { useEvent, useHandler } from "react-native-reanimated";

type Handlers = Parameters<typeof useHandler>[0];
type Dependencies = Parameters<typeof useHandler>[1];

export function usePageScrollHandler(
  handlers: Handlers,
  dependencies?: Dependencies
) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies);
  const subscribeForEvents = ["onPageScroll"];

  return useEvent(
    (event) => {
      "worklet";
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith("onPageScroll")) {
        onPageScroll(event, context);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  );
}
