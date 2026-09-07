import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import Jimp from "jimp-compact";

const CANVAS_SIZE = 1024;
const ALPHA_THRESHOLD = 8;

// Android adaptive icons are 108dp layers. Every launcher mask keeps the centered
// 66dp circle visible, so all artwork is fitted inside that circle. The margin
// absorbs the rounding done when resizing and compositing.
const SAFE_ZONE_DIAMETER = CANVAS_SIZE * (66 / 108) * 0.985;

// The white checkmark inside the green badge becomes a hole in the themed-icon
// silhouette. Sampled layer colors: checkmark is luminance 1.00 / saturation 0.00,
// the green badge is 0.56 / 0.40, the serif W is 0.25 / 0.00, and the dev badge
// yellow is 0.75 / 1.00.
const HOLE_MIN_LUMINANCE = 0.9;
const HOLE_MAX_SATURATION = 0.15;

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const imagesDirectory = path.join(projectRoot, "assets", "images");

// Both bundles share the same background plate, so only the release bundle emits it.
const variants = [
  { bundleName: "word-check.icon", suffix: "", emitBackground: true },
  { bundleName: "word-check-dev.icon", suffix: "-dev", emitBackground: false },
];

function sanitizeChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

function decodeTransfer(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function encodeTransfer(value) {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
}

function parseDisplayP3(colorString) {
  const match = /^display-p3:([\d.,\s-]+)$/.exec(colorString);
  if (!match) {
    throw new Error(`Unsupported fill color: ${colorString}`);
  }
  const [red, green, blue] = match[1].split(",").map((part) => decodeTransfer(Number(part)));
  const linear = [
    1.2249 * red - 0.2247 * green,
    -0.042 * red + 1.0419 * green,
    -0.0197 * red - 0.0786 * green + 1.0979 * blue,
  ];
  const [sourceRed, sourceGreen, sourceBlue] = linear.map((channel) =>
    sanitizeChannel(encodeTransfer(Math.max(0, Math.min(1, channel))))
  );
  return Jimp.rgbaToInt(sourceRed, sourceGreen, sourceBlue, 255);
}

function readIconDocument(bundlePath) {
  const document = JSON.parse(fs.readFileSync(path.join(bundlePath, "icon.json"), "utf8"));
  const layers = [];
  for (const group of document.groups ?? []) {
    for (const layer of group.layers ?? []) {
      if (layer.hidden === true || !layer["image-name"]) {
        continue;
      }
      const translation = layer.position?.["translation-in-points"] ?? [0, 0];
      layers.push({
        imageName: layer["image-name"],
        scale: layer.position?.scale ?? 1,
        translationX: translation[0],
        translationY: translation[1],
      });
    }
  }
  // Icon Composer stores layers front to back, and the last one is the background plate.
  return {
    fillColor: parseDisplayP3(document.fill["automatic-gradient"]),
    backgroundLayer: layers.at(-1),
    foregroundLayers: layers.slice(0, -1).reverse(),
  };
}

async function drawLayers(bundlePath, layers, backgroundColor) {
  const canvas = new Jimp(CANVAS_SIZE, CANVAS_SIZE, backgroundColor);
  for (const layer of layers) {
    const image = await Jimp.read(path.join(bundlePath, "Assets", layer.imageName));
    const width = Math.round(image.bitmap.width * layer.scale);
    const height = Math.round(image.bitmap.height * layer.scale);
    image.resize(width, height, Jimp.RESIZE_BICUBIC);
    canvas.composite(
      image,
      Math.round(CANVAS_SIZE / 2 - width / 2 + layer.translationX),
      Math.round(CANVAS_SIZE / 2 - height / 2 + layer.translationY)
    );
  }
  return canvas;
}

// Only the leftmost and rightmost opaque pixel of each row can bound the artwork.
function collectExtremePoints(image) {
  const { width, height, data } = image.bitmap;
  const points = [];
  for (let y = 0; y < height; y++) {
    let leftmost = -1;
    let rightmost = -1;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (leftmost === -1) {
          leftmost = x;
        }
        rightmost = x;
      }
    }
    if (leftmost !== -1) {
      points.push([leftmost, y]);
      if (rightmost !== leftmost) {
        points.push([rightmost, y]);
      }
    }
  }
  return points;
}

// Shrinking-ball approximation of the minimal enclosing circle. Centering on this
// rather than the bounding box lets the artwork be as large as the safe zone allows.
function findEnclosingCircle(points) {
  let centerX = 0;
  let centerY = 0;
  for (const [x, y] of points) {
    centerX += x;
    centerY += y;
  }
  centerX /= points.length;
  centerY /= points.length;

  let step = 0.1;
  for (let iteration = 0; iteration < 1500; iteration++) {
    let farthestX = centerX;
    let farthestY = centerY;
    let farthestDistance = -1;
    for (const [x, y] of points) {
      const distance = (x - centerX) ** 2 + (y - centerY) ** 2;
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestX = x;
        farthestY = y;
      }
    }
    centerX += (farthestX - centerX) * step;
    centerY += (farthestY - centerY) * step;
    step *= 0.995;
  }

  let radius = 0;
  for (const [x, y] of points) {
    radius = Math.max(radius, Math.hypot(x - centerX, y - centerY));
  }
  return { centerX, centerY, radius };
}

function fitIntoSafeZone(image) {
  const points = collectExtremePoints(image);
  if (points.length === 0) {
    throw new Error("Layer composite is fully transparent");
  }
  const { centerX, centerY, radius } = findEnclosingCircle(points);
  const scale = SAFE_ZONE_DIAMETER / 2 / radius;
  const scaled = image
    .clone()
    .resize(Math.round(CANVAS_SIZE * scale), Math.round(CANVAS_SIZE * scale), Jimp.RESIZE_BICUBIC);
  const canvas = new Jimp(CANVAS_SIZE, CANVAS_SIZE, 0x00000000);
  canvas.composite(
    scaled,
    Math.round(CANVAS_SIZE / 2 - centerX * scale),
    Math.round(CANVAS_SIZE / 2 - centerY * scale)
  );
  return { image: canvas, scale, radius };
}

function toMonochrome(image) {
  const silhouette = image.clone();
  const { width, height, data } = silhouette.bitmap;
  for (let index = 0; index < width * height * 4; index += 4) {
    const alpha = data[index + 3];
    if (alpha <= ALPHA_THRESHOLD) {
      data[index + 3] = 0;
      continue;
    }
    const red = data[index] / 255;
    const green = data[index + 1] / 255;
    const blue = data[index + 2] / 255;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const maximum = Math.max(red, green, blue);
    const saturation = maximum === 0 ? 0 : (maximum - Math.min(red, green, blue)) / maximum;
    const isHole = luminance > HOLE_MIN_LUMINANCE && saturation < HOLE_MAX_SATURATION;
    data[index] = 255;
    data[index + 1] = 255;
    data[index + 2] = 255;
    data[index + 3] = isHole ? 0 : alpha;
  }
  return silhouette;
}

async function writeImage(image, fileName) {
  const outputPath = path.join(imagesDirectory, fileName);
  await image.writeAsync(outputPath);
  console.log(`  wrote ${path.relative(projectRoot, outputPath)}`);
}

// A background plate that already fills the canvas is copied rather than redrawn,
// so it keeps the source file's PNG compression.
async function writeBackground(bundlePath, layer, fillColor) {
  const sourcePath = path.join(bundlePath, "Assets", layer.imageName);
  const source = await Jimp.read(sourcePath);
  const fillsCanvas =
    layer.scale === 1 &&
    layer.translationX === 0 &&
    layer.translationY === 0 &&
    source.bitmap.width === CANVAS_SIZE &&
    source.bitmap.height === CANVAS_SIZE &&
    !source.hasAlpha();

  if (fillsCanvas) {
    const outputPath = path.join(imagesDirectory, "adaptive-background.png");
    fs.copyFileSync(sourcePath, outputPath);
    console.log(`  copied ${path.relative(projectRoot, outputPath)}`);
    return;
  }
  await writeImage(await drawLayers(bundlePath, [layer], fillColor), "adaptive-background.png");
}

for (const { bundleName, suffix, emitBackground } of variants) {
  const bundlePath = path.join(imagesDirectory, bundleName);
  console.log(`${bundleName}:`);
  const { fillColor, backgroundLayer, foregroundLayers } = readIconDocument(bundlePath);

  const legacyIcon = await drawLayers(
    bundlePath,
    [backgroundLayer, ...foregroundLayers],
    fillColor
  );
  await writeImage(legacyIcon, `icon${suffix}.png`);

  if (emitBackground) {
    await writeBackground(bundlePath, backgroundLayer, fillColor);
  }

  const foreground = await drawLayers(bundlePath, foregroundLayers, 0x00000000);
  const fitted = fitIntoSafeZone(foreground);
  console.log(
    `  fitted foreground: radius ${fitted.radius.toFixed(1)}px, scale ${fitted.scale.toFixed(4)}`
  );
  await writeImage(fitted.image, `adaptive-foreground${suffix}.png`);
  await writeImage(toMonochrome(fitted.image), `adaptive-monochrome${suffix}.png`);
}
