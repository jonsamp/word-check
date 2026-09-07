#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";

const ASC_BASE = "https://api.appstoreconnect.apple.com";
const APP_CONFIG_CANDIDATES = ["app.config.ts", "app.config.js", "app.config.mjs", "app.json"];
const MAX_BUMPS = 100;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseOptions(argv) {
  const flags = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const separator = arg.indexOf("=");
    if (separator === -1) {
      flags[arg.slice(2)] = argv[++index];
    } else {
      flags[arg.slice(2, separator)] = arg.slice(separator + 1);
    }
  }
  return {
    mode: flags.mode ?? process.env.VERSION_MODE ?? "next",
    appId: flags["app-id"] ?? process.env.APPLE_APP_ID ?? null,
    submitProfile: flags["submit-profile"] ?? process.env.SUBMIT_PROFILE ?? "production",
    appConfig: flags["app-config"] ?? process.env.APP_CONFIG_PATH ?? null,
    platform: flags.platform ?? process.env.APPLE_PLATFORM ?? "IOS",
  };
}

function resolveAppId(options) {
  if (options.appId) return options.appId;
  if (!fs.existsSync("eas.json")) {
    fail("No eas.json found. Pass the App Store Connect app id with --app-id.");
  }
  const easConfig = JSON.parse(fs.readFileSync("eas.json", "utf8"));
  const appId = easConfig.submit?.[options.submitProfile]?.ios?.ascAppId;
  if (!appId) {
    const location = `submit.${options.submitProfile}.ios.ascAppId`;
    fail(`Missing ${location} in eas.json. Pass the app id with --app-id.`);
  }
  return appId;
}

function readCurrentVersion(options) {
  const candidates = options.appConfig ? [options.appConfig] : APP_CONFIG_CANDIDATES;
  const appConfigPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!appConfigPath) {
    fail(`No app config found. Looked for: ${candidates.join(", ")}`);
  }

  const contents = fs.readFileSync(appConfigPath, "utf8");
  let version = null;

  if (appConfigPath.endsWith(".json")) {
    const appConfig = JSON.parse(contents);
    version = appConfig.expo?.version ?? appConfig.version ?? null;
  } else {
    const match = contents.match(/process\.env\.APP_VERSION\s*\|\|\s*["']([^"']+)["']/);
    version = match ? match[1] : null;
  }

  if (!version) {
    fail(`Could not read a version from ${appConfigPath}`);
  }

  console.error(`Current version from ${appConfigPath}: ${version}`);
  return version;
}

function createJwt() {
  const keyPath = process.env.ASC_API_KEY_P8;
  const keyId = process.env.ASC_API_KEY_ID;
  const issuerId = process.env.ASC_API_ISSUER_ID;
  if (!keyPath || !keyId || !issuerId) {
    fail("Missing ASC_API_KEY_P8, ASC_API_KEY_ID, or ASC_API_ISSUER_ID in the environment.");
  }

  const key = fs.readFileSync(keyPath, "utf8");
  const issuedAt = Math.floor(Date.now() / 1000);
  const toBase64Url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const signingInput = [
    toBase64Url({ alg: "ES256", kid: keyId, typ: "JWT" }),
    toBase64Url({ iss: issuerId, iat: issuedAt, exp: issuedAt + 1200, aud: "appstoreconnect-v1" }),
  ].join(".");

  const signer = crypto.createSign("SHA256");
  signer.update(signingInput);
  const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" }, "base64url");
  return `${signingInput}.${signature}`;
}

async function ascFetch(path, jwt) {
  const response = await fetch(ASC_BASE + path, {
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    fail(`ASC API GET ${path} returned HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function compareVersions(versionA, versionB) {
  const partsA = versionA.split(".").map((part) => parseInt(part, 10) || 0);
  const partsB = versionB.split(".").map((part) => parseInt(part, 10) || 0);
  const length = Math.max(partsA.length, partsB.length);
  for (let index = 0; index < length; index++) {
    const difference = (partsA[index] ?? 0) - (partsB[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function isAlreadySubmitted(version) {
  return version.attributes.appStoreState !== "PREPARE_FOR_SUBMISSION";
}

function isLiveOnStore(version) {
  return version.attributes.appStoreState === "READY_FOR_SALE";
}

function bumpVersion(version) {
  const parts = version.split(".");
  const last = parseInt(parts[parts.length - 1], 10);
  if (Number.isNaN(last)) {
    fail(`Cannot bump version "${version}": the last segment is not a number.`);
  }
  parts[parts.length - 1] = String(last + 1);
  return parts.join(".");
}

async function fetchAppStoreVersions(appId, platform, jwt, versionString) {
  const filters = [`filter[platform]=${platform}`, "limit=50"];
  if (versionString) {
    filters.push(`filter[versionString]=${encodeURIComponent(versionString)}`);
  }
  const body = await ascFetch(`/v1/apps/${appId}/appStoreVersions?${filters.join("&")}`, jwt);
  return body.data ?? [];
}

async function resolveNextVersion(options, appId, jwt) {
  let version = readCurrentVersion(options);
  for (let attempt = 0; attempt < MAX_BUMPS; attempt++) {
    console.error(`Checking if ${version} exists on App Store Connect...`);
    const versions = await fetchAppStoreVersions(appId, options.platform, jwt, version);
    const submitted = versions.filter(isAlreadySubmitted);
    if (submitted.length === 0) {
      console.error(`Version ${version} is available`);
      return version;
    }
    console.error(`Version ${version} is already submitted`);
    version = bumpVersion(version);
  }
  fail(`Gave up after ${MAX_BUMPS} version bumps.`);
}

async function resolveLiveVersion(options, appId, jwt) {
  const versions = await fetchAppStoreVersions(appId, options.platform, jwt);
  const liveVersions = versions
    .filter(isLiveOnStore)
    .map((entry) => entry.attributes.versionString)
    .sort((first, second) => compareVersions(second, first));
  if (liveVersions.length === 0) {
    fail("Could not find a version currently on the store (READY_FOR_SALE)");
  }
  console.error(`Version currently on the store: ${liveVersions[0]}`);
  return liveVersions[0];
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.mode !== "next" && options.mode !== "live") {
    fail(`Unknown mode "${options.mode}". Use "next" or "live".`);
  }

  const appId = resolveAppId(options);
  console.error(`App Store Connect app id: ${appId}`);
  const jwt = createJwt();

  const version =
    options.mode === "next"
      ? await resolveNextVersion(options, appId, jwt)
      : await resolveLiveVersion(options, appId, jwt);

  console.log(version);
}

main();
