import AppMetrics from "expo-app-metrics";
import { Observe } from "expo-observe";

type LogEvent = typeof Observe.logEvent;

/**
 * Logs an analytics event without ever crashing the caller.
 *
 * `Observe.logEvent` is a Proxy (expo-observe) that delegates `logEvent` to the
 * native `ExpoAppMetrics` module. On Android the proxy's `prop in nativeModule`
 * check misroutes — the JSI host object answers the `in` operator differently
 * than iOS — so `Observe.logEvent` resolves to `undefined` and calling it throws
 * "undefined is not a function" (iOS resolves it fine). We prefer the proxy when
 * it's callable, otherwise call the underlying `AppMetrics.logEvent` directly
 * (functionally identical — the proxy is a passthrough for events). The whole
 * thing is guarded because analytics must never break a user-facing flow.
 */
export const logEvent: LogEvent = (...args) => {
  try {
    if (typeof Observe.logEvent === "function") {
      Observe.logEvent(...args);
    } else {
      AppMetrics.logEvent(...args);
    }
  } catch {
    // Swallow — a failed analytics call must not surface to the user.
  }
};
