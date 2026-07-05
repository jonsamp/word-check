/**
 * XDE — dev-only remote control bridge.
 * ----------------------------------------------------------------------------
 * Self-contained module that lets the XDE desktop tool drive a running app over
 * the `expo/devtools` plugin bridge: flip the theme, navigate, simulate an
 * offline device, and mirror routes across every connected device.
 *
 * This file is intentionally free of app-specific imports — it depends only on
 * `react`, `react-native`, `expo-router`, and `expo/devtools` — so it can be
 * lifted out into a standalone npm package without changes. To reuse it
 * elsewhere, copy this one file and mount `<XDE />` once near the root of your
 * Expo Router app (see the export docs below).
 *
 * Public API:
 *   - `<XDE />`               Mount once at the app root. No-op in production.
 *   - `XDEProps`              Config: `pluginName` + per-feature toggles.
 *   - `XDEFeatures`           The feature-toggle shape.
 *   - `isNetworkEnabled()`    Read the current network kill-switch state.
 *   - `setNetworkEnabled(b)`  Drive the network kill switch from app code.
 *
 * The whole bridge is gated on `__DEV__`, so it ships nothing to production.
 */

import { type Href, router, useNavigationContainerRef, usePathname } from "expo-router";
import { useDevToolsPluginClient } from "expo/devtools";
import { useEffect, useRef } from "react";
import { Appearance } from "react-native";

/**
 * Default devtools plugin channel name. This is a free-form channel ID, NOT the
 * Expo project name/slug — it identifies the XDE tool, so the same value is used
 * in every project. It only has to match the channel the desktop tool listens on.
 * Override via `<XDE pluginName="..." />` only if you rename the desktop channel,
 * and then use that same name in every project.
 */
export const DEFAULT_PLUGIN_NAME = "xde-remote";

/** Loosely typed devtools client (the API `useDevToolsPluginClient` returns). */
type DevToolsClient = ReturnType<typeof useDevToolsPluginClient>;

export type XDEFeatures = {
  /** Theme toggling from the desktop tool. Default: on. */
  theme?: boolean;
  /** Navigation control (e.g. back) from the desktop tool. Default: on. */
  navigation?: boolean;
  /** Network kill switch — offline/online simulation. Default: on. */
  network?: boolean;
  /** Cross-device route mirroring + desktop address bar. Default: on. */
  routeSync?: boolean;
};

export type XDEProps = {
  /**
   * Devtools plugin channel name. Must match the name the desktop tool
   * broadcasts to. Defaults to {@link DEFAULT_PLUGIN_NAME}.
   */
  pluginName?: string;
  /** Selectively enable/disable capabilities. Everything is on by default. */
  features?: XDEFeatures;
};

/**
 * Mount this once near the root of your app (inside the navigation tree, so the
 * route hooks work). It renders nothing and self-disables outside `__DEV__`.
 *
 * @example
 * export default function RootLayout() {
 *   return (
 *     <ThemeProvider value={...}>
 *       <Stack>{...}</Stack>
 *       <XDE />
 *     </ThemeProvider>
 *   );
 * }
 */
export function XDE(props: XDEProps) {
  // The entire bridge is dev-only. `__DEV__` is a build-time constant, so this
  // early return is stable for the component's lifetime (it never flips at
  // runtime, so hook order below is never violated) and the inner tree is
  // dead-code-eliminated from production bundles.
  if (!__DEV__) {
    return null;
  }
  return <XDEBridge {...props} />;
}

function XDEBridge({ pluginName = DEFAULT_PLUGIN_NAME, features }: XDEProps) {
  // One client shared by every concern — a single bridge connection. The
  // remote-control and route-sync message types never overlap, so they coexist.
  const client = useDevToolsPluginClient(pluginName);

  const theme = features?.theme ?? true;
  const navigation = features?.navigation ?? true;
  const network = features?.network ?? true;
  const routeSync = features?.routeSync ?? true;

  useRemoteControl(client, { navigation, network });
  useThemeSync(client, theme);
  useRouteSync(client, routeSync);

  return null;
}

// ---------------------------------------------------------------------------
// Network kill switch (the fetch "middleware")
// ---------------------------------------------------------------------------

/**
 * Patches the global `fetch` so that, when disabled, requests fail immediately
 * as if the device were offline — letting the desktop tool simulate no network.
 * Every `fetch` in the app passes through this wrapper.
 *
 * Only `fetch` is intercepted — not the WebSocket the dev tooling runs on — so
 * toggling the network off never disconnects the bridge, and you can always turn
 * it back on.
 */
let networkEnabled = true;
let killSwitchInstalled = false;

/** Read the current network kill-switch state. */
export function isNetworkEnabled(): boolean {
  return networkEnabled;
}

/** Drive the network kill switch (also used by the desktop tool's messages). */
export function setNetworkEnabled(next: boolean): void {
  networkEnabled = next;
}

function installNetworkKillSwitch(): void {
  if (killSwitchInstalled) {
    return;
  }
  killSwitchInstalled = true;

  const target = globalThis as { fetch: typeof fetch };
  const originalFetch = target.fetch;

  // Cast: `fetch` is an overloaded type (it also accepts `URL`), so a single
  // wrapper signature isn't directly assignable — but the overloaded original is
  // assignable to ours, which makes the assertion safe.
  target.fetch = ((...args: Parameters<typeof fetch>) => {
    if (!networkEnabled) {
      return Promise.reject(new TypeError("Network request failed"));
    }
    return originalFetch(...args);
  }) as typeof fetch;
}

// ---------------------------------------------------------------------------
// Remote control: navigation, network
// ---------------------------------------------------------------------------

type RemoteControlFlags = { navigation: boolean; network: boolean };

/**
 * Runs app functions when the desktop tool sends a signal: navigation and the
 * network kill switch. (Theme is its own synced concern — see useThemeSync.)
 */
function useRemoteControl(client: DevToolsClient, flags: RemoteControlFlags) {
  const { navigation, network } = flags;

  // Install the fetch kill switch once, up front (network defaults to on).
  useEffect(() => {
    if (network) {
      installNetworkKillSwitch();
    }
  }, [network]);

  useEffect(() => {
    if (!client) {
      return;
    }

    const subscriptions = [
      // Navigation: currently just "back".
      navigation &&
        client.addMessageListener("nav", (payload?: { action?: string }) => {
          if (payload?.action === "back" && router.canGoBack()) {
            router.back();
          }
        }),

      // Network: simulate device offline/online via the fetch kill switch.
      network &&
        client.addMessageListener("setNetworkEnabled", (payload?: { enabled?: boolean }) => {
          setNetworkEnabled(payload?.enabled !== false);
        }),
    ];

    // Ask the desktop for the current network setting (in case it was toggled
    // off before this app connected).
    if (network) {
      client.sendMessage("requestNetworkEnabled", {});
    }

    return () =>
      subscriptions.forEach((subscription) => {
        if (subscription) {
          subscription.remove();
        }
      });
  }, [client, navigation, network]);
}

// ---------------------------------------------------------------------------
// Theme sync: keep every connected app on the same light/dark scheme
// ---------------------------------------------------------------------------

type Scheme = "light" | "dark";

/**
 * The device's *current* effective scheme as a concrete 'light' | 'dark'.
 * `Appearance.getColorScheme()` returns the resolved system scheme even when the
 * app is on "auto" (`'unspecified'`), and may return `'unspecified'`/`null` if the
 * native module is briefly unavailable — all of which we treat as 'light'. This is
 * only used to *seed* a device's first contribution to the group; once a shared
 * scheme has been agreed we drive explicit values and never read auto again.
 */
function resolveScheme(): Scheme {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

/**
 * How long after a theme change a *bare flip* is ignored, to absorb the rapid repeat /
 * contact bounce of a hardware "toggle theme" button — a software click sends one clean
 * event, but a physical button can emit several in a burst, and each bare flip would
 * otherwise toggle the scheme again (a light/dark flicker). One press → one flip.
 * Explicit `toggleTheme { value }` sets bypass this: they're absolute, not relative, so
 * repeats are idempotent and can't oscillate.
 */
const THEME_FLIP_THROTTLE_MS = 200;

/**
 * Keep the theme identical across every connected app, and flip them together.
 *
 * Why this isn't just `setColorScheme(flip(getColorScheme()))`:
 *   The desktop "toggle theme" button broadcasts a bare `toggleTheme` (no value) to
 *   *every* connected app at once. If each app flipped its OWN current scheme, apps
 *   that started on different schemes would just swap and stay mismatched — and a
 *   device on "auto" (`unspecified`, e.g. an iPhone following the system) resolves to
 *   whatever iOS is set to, a different base than a simulator's, so they drift apart
 *   on every toggle. That's the "apps get out of sync" / "auto theme mismatches" bug.
 *
 * The model — one shared scheme, synced like XDE's other concerns:
 *   We hold a single agreed scheme (`value`) plus a Lamport `epoch`, and converge all
 *   apps onto it. A toggle flips the SHARED value (not the device's own auto-resolved
 *   scheme) and broadcasts the resolved explicit scheme, so every app lands on the
 *   same one and they flip in lockstep — back and forth. Driving explicit 'light' /
 *   'dark' also overrides "auto" on each device, which is what pulls an auto iPhone
 *   back into line.
 *
 * Convergence (so apps can never end up swapped):
 *   A `syncTheme { value, epoch }` is adopted iff it's *newer* — a higher epoch wins;
 *   an equal epoch breaks deterministically toward 'dark' (`next < value` orders 'dark'
 *   before 'light'). Higher-epoch-wins means a long-running session's scheme dominates
 *   a freshly connected device's seed; the tiebreak only matters at epoch 0, when two
 *   devices seed different schemes at the same moment. Applying a remote scheme never
 *   re-broadcasts, so there's no echo storm.
 *
 * On connect we both ANNOUNCE our scheme and ASK peers for theirs (`requestTheme`), so
 * a newly joined device (the auto iPhone) and the running group converge immediately —
 * before any toggle — via that same newer-wins rule. A low-epoch newcomer can't yank
 * the group: its announce loses to the group's higher epoch, and the group's reply
 * brings the newcomer up to date.
 */
function useThemeSync(client: DevToolsClient, enabled: boolean) {
  // Singletons (XDE mounts once): the agreed scheme and its Lamport epoch. `value`
  // starts null and is seeded from the device on first connect; it survives reconnects
  // so we keep contributing the group's agreed scheme rather than re-reading auto.
  const value = useRef<Scheme | null>(null);
  const epoch = useRef(0);
  // Timestamp (ms) of the last theme change from ANY source — a local toggle or a scheme
  // adopted from a peer. A bare flip landing within THEME_FLIP_THROTTLE_MS of it is
  // dropped (see the toggleTheme listener), collapsing a hardware button's bounce and the
  // cross-device echo into a single flip.
  const lastChangeAt = useRef(0);

  useEffect(() => {
    if (!client || !enabled) {
      return;
    }

    if (value.current == null) {
      value.current = resolveScheme();
    }

    const apply = (next: Scheme, nextEpoch: number) => {
      value.current = next;
      epoch.current = nextEpoch;
      lastChangeAt.current = Date.now();
      Appearance.setColorScheme(next); // explicit value overrides "auto" on this device
    };

    const subscriptions = [
      // Desktop "toggle theme" button (bare `toggleTheme`) or an explicit set. Flip the
      // SHARED scheme — not this device's own — bump the epoch, and broadcast so every
      // app converges on the same result instead of each flipping independently.
      client.addMessageListener("toggleTheme", (payload?: { value?: Scheme }) => {
        // Throttle bare flips: drop one that arrives within THEME_FLIP_THROTTLE_MS of the
        // last change (local OR adopted from a peer). That collapses a hardware button's
        // contact bounce into one flip, and stops a peer's syncTheme — which we already
        // applied, arming the window — from double-flipping us. Explicit `value` sets are
        // absolute and always applied.
        if (
          payload?.value === undefined &&
          Date.now() - lastChangeAt.current < THEME_FLIP_THROTTLE_MS
        ) {
          return;
        }
        const next = payload?.value ?? (value.current === "dark" ? "light" : "dark");
        apply(next, epoch.current + 1);
        client.sendMessage("syncTheme", { value: next, epoch: epoch.current });
      }),

      // A peer changed (or announced) its scheme. Adopt only if newer; equal epochs
      // break toward 'dark'. Never re-broadcast (would echo-storm the relay).
      client.addMessageListener("syncTheme", (payload?: { value?: Scheme; epoch?: number }) => {
        const next = payload?.value;
        if (next !== "light" && next !== "dark") {
          return;
        }
        const theirEpoch = payload?.epoch ?? 0;
        const newer =
          theirEpoch > epoch.current ||
          (theirEpoch === epoch.current && next < (value.current ?? "light"));
        if (newer) {
          apply(next, theirEpoch);
        }
      }),

      // A peer is asking where the group is — announce our scheme so it converges on us.
      client.addMessageListener("requestTheme", () => {
        client.sendMessage("syncTheme", { value: value.current, epoch: epoch.current });
      }),
    ];

    // Announce our scheme and ask peers for theirs, so we converge on connect.
    client.sendMessage("syncTheme", { value: value.current, epoch: epoch.current });
    client.sendMessage("requestTheme", {});

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [client, enabled]);
}

// ---------------------------------------------------------------------------
// Route sync: cross-device mirroring + desktop address bar
// ---------------------------------------------------------------------------

type SyncOp = "push" | "back" | "navigate";

/** Minimal recursive shape of a React Navigation state tree (only what we read). */
type NavStateNode = {
  type?: string;
  index?: number;
  routes?: { state?: NavStateNode }[];
};

/**
 * Total stack depth across the focused navigation path: the sum of every stack
 * navigator's screen count from the root down to the focused leaf. Pushing a screen
 * (including a modal) at any level adds 1; popping subtracts 1; switching tabs at the
 * same level leaves it unchanged — exactly the signal route-sync needs to classify a
 * move as push / back / navigate.
 *
 * Why traverse the container ref's state instead of `useRootNavigationState()`:
 * `useRootNavigationState()` reads React Navigation *context*, so its value depends on
 * where the calling component sits in the tree. `<XDE />` is mounted as a sibling of
 * `<Stack>` (outside the navigator), where that hook reports a CONSTANT depth — so
 * every move looked like a same-level `navigate`, and a mirrored "go back" out of a
 * modal became `navigate(homeHref)`, which can't dismiss the modal and instead stacks
 * the home screen on top of it. Reading the navigation container ref (the global
 * store's source of truth, the same one the imperative `router` uses) is
 * position-independent and reports the real depth.
 */
function getStackDepth(state: NavStateNode | undefined): number {
  let depth = 0;
  let node = state;
  while (node?.routes?.length) {
    if (node.type === "stack") {
      depth += node.routes.length;
    }
    const index = node.index ?? node.routes.length - 1;
    node = node.routes[index]?.state;
  }
  return depth || 1;
}

/**
 * Route mirroring across every app connected to the same dev server (e.g. an iOS
 * and an Android simulator at once). When you navigate in one app, the others
 * follow — including back/pop, not just forward pushes. Harmless with a single
 * device.
 *
 * Direction (the important part):
 *   Each app keeps its own ordered stack of pathnames in `history` — one entry
 *   per root-stack level, so `history.length` === root depth. When *this* app
 *   moves, we classify the move from our OWN previous depth and broadcast the
 *   resolved operation. We never compare depth across devices: that desyncs
 *   silently — once a follower is even one level shallower than the leader,
 *   every message looks like a push, so going *back* on the leader re-pushes the
 *   old route on the follower forever (the bug this replaces).
 *     - depth increased → we pushed   → followers `push(href)`
 *     - depth decreased → we popped    → followers pop by depth delta (`dismiss`)
 *     - depth unchanged → same level   → followers `navigate(href)` (e.g. tabs)
 *   A "back" carries the post-move `depth`, and followers mirror it with a REAL pop
 *   — `router.dismiss(theirDepth - depth)` — not `dismissTo(href)`. The href after a
 *   pop is often a *nested* route (e.g. the home tab `/`) that isn't an entry in the
 *   stack holding the screen being popped: a modal/pushed screen sits in the ROOT
 *   stack, while the tab lives inside `(tabs)`. `dismissTo` can't find a nested href
 *   in that stack, so per its contract it *replaces* the current screen with it —
 *   stacking the home screen on top of the modal instead of dismissing it. A
 *   depth-delta `dismiss` is modal-safe. Only when the follower has drifted shallower
 *   (nothing left to dismiss) do we fall back to `dismissTo(href)`, whose replace
 *   behavior re-converges it on the absolute target so it never gets stuck.
 *
 * Loop prevention:
 *   1. Suppress the echo: record the href we navigate to from a remote message;
 *      our own observer sees it and skips re-broadcasting.
 *   2. Dedupe on receive: ignore a route we're already on.
 *   The relay never echoes to the sender, so an app never reacts to its own message.
 *
 * Two message types:
 *   - `syncRoute`    — navigation mirror, `{ href, op, depth }` (loop-guarded).
 *   - `routeChanged` — telemetry `{ href, depth }`, sent on every change incl.
 *     first connect, and on demand via `requestRoute`. Apps ignore it; external
 *     tools (the desktop UI) use it to display the current route.
 */
function useRouteSync(client: DevToolsClient, enabled: boolean) {
  const pathname = usePathname();
  // Stack depth read from the navigation container ref (global store) so it's correct
  // no matter where <XDE /> is mounted. `pathname` (also from the global store) is the
  // reactive trigger — it changes on every move, so we recompute the fresh depth here.
  // See getStackDepth for why useRootNavigationState() can't be used from this spot.
  const navRef = useNavigationContainerRef();
  const depth = navRef.isReady() ? getStackDepth(navRef.getRootState() as NavStateNode) : 1;

  const applyingRemoteHref = useRef<string | null>(null);
  const skipNextBroadcast = useRef(true);
  // Device↔device mirroring on/off, controlled from the desktop tool. Default on.
  // Gates only `syncRoute` (auto mirroring) — the address bar (`navigateTo`) and
  // route telemetry keep working regardless.
  const syncEnabled = useRef(true);
  // Our own ordered route stack: one pathname per root-stack level, so
  // `history.current.length` === `depth`. Rebuilt on every observed move (local
  // or remote) so the sender can classify its next move by depth delta and the
  // receiver can tell whether it already holds an incoming route.
  const history = useRef<string[]>([]);
  // Live mirrors for the once-registered listeners (refs avoid re-subscribing).
  const currentPathname = useRef(pathname);
  const currentDepth = useRef(depth);

  // Observe every route change, keep `history` current, and broadcast our moves.
  useEffect(() => {
    if (!client || !enabled) {
      return;
    }

    // Read the pre-move state before we overwrite it.
    const prevDepth = history.current.length;
    const sameRoute = pathname === history.current[prevDepth - 1];

    // Rebuild the stack for this observation: keep the levels below us, set ours.
    const nextHistory = history.current.slice(0, depth - 1);
    nextHistory[depth - 1] = pathname;
    history.current = nextHistory;
    currentPathname.current = pathname;
    currentDepth.current = depth;

    // Telemetry: report on every change (incl. first connect) for external tools.
    client.sendMessage("routeChanged", { href: pathname, depth });

    if (skipNextBroadcast.current) {
      // Don't broadcast the route we were on when sync connected — that would
      // yank already-running devices when a new one joins.
      skipNextBroadcast.current = false;
      return;
    }
    if (applyingRemoteHref.current === pathname) {
      // This change came from an incoming sync — clear the flag, don't echo.
      applyingRemoteHref.current = null;
      return;
    }
    if (!syncEnabled.current) {
      return;
    } // device↔device sync toggled off
    if (sameRoute) {
      return;
    } // depth-only churn, not a navigational move

    const op: SyncOp = depth > prevDepth ? "push" : depth < prevDepth ? "back" : "navigate";
    // Include our post-move depth so a follower can mirror a pop as a real
    // `dismiss(delta)` (modal-safe) rather than `dismissTo(href)`.
    client.sendMessage("syncRoute", { href: pathname, op, depth });
  }, [client, enabled, pathname, depth]);

  // Receiver + on-demand route reply (registered once per connection).
  useEffect(() => {
    if (!client || !enabled) {
      return;
    }

    const subscriptions = [
      client.addMessageListener(
        "syncRoute",
        (payload?: { href?: string; op?: SyncOp; depth?: number }) => {
          if (!syncEnabled.current) {
            return;
          } // device↔device sync toggled off
          const href = payload?.href;
          if (!href || href === currentPathname.current) {
            return;
          }

          applyingRemoteHref.current = href;
          const op = payload?.op ?? "navigate";

          if (op === "back") {
            // They popped. Mirror it with a REAL pop, not `dismissTo(href)`: after a
            // pop the href is often a nested route (e.g. the home tab `/`) that isn't
            // an entry in the stack holding the screen we must pop (a modal/pushed
            // screen lives in the root stack). `dismissTo` can't find it there and
            // instead *replaces* the current screen — stacking the home screen on top
            // of the modal. Popping by depth delta is modal-safe and lands on `href`
            // when the stacks are in sync.
            const targetDepth = payload?.depth;
            const delta = targetDepth == null ? 1 : currentDepth.current - targetDepth;
            if (delta > 0 && router.canDismiss()) {
              router.dismiss(delta);
            } else {
              // Drifted shallower (nothing to dismiss) → converge on the absolute
              // href. `dismissTo` replaces the current screen if href isn't in the
              // stack, so it never gets stuck.
              router.dismissTo(href as Href);
            }
          } else if (op === "push") {
            // They pushed. If we somehow already hold this route, pop to it instead
            // of stacking a duplicate (self-heal after drift).
            if (history.current.includes(href)) {
              router.dismissTo(href as Href);
            } else {
              router.push(href as Href);
            }
          } else {
            router.navigate(href as Href); // same level → tab switch / replace
          }
        }
      ),

      // Reply to a tool asking where we are (powers the desktop route display).
      client.addMessageListener("requestRoute", () => {
        client.sendMessage("routeChanged", {
          href: currentPathname.current,
          depth: currentDepth.current,
        });
      }),

      // Drive navigation from a tool (the desktop address bar). Plain navigate,
      // browser-style. The relay delivers this to every app, so all devices go
      // together; we suppress the syncRoute echo since they already received it.
      client.addMessageListener("navigateTo", (payload?: { href?: string }) => {
        const href = payload?.href;
        if (!href || href === currentPathname.current) {
          return;
        }
        applyingRemoteHref.current = href;
        router.navigate(href as Href);
      }),

      // Desktop toggles device↔device mirroring on/off.
      client.addMessageListener("setSyncEnabled", (payload?: { enabled?: boolean }) => {
        syncEnabled.current = payload?.enabled !== false;
      }),
    ];

    // Ask the desktop for the current sync setting (in case it was toggled off
    // before this app connected).
    client.sendMessage("requestSyncEnabled", {});

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [client, enabled]);
}
