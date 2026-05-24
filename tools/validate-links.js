#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const tutorialsRoot = path.join(repoRoot, "tutorials");
const reportPath = path.join(repoRoot, "tools", "validation-report.json");
const allowedExternalSchemes = /^(https?:|mailto:|tel:|data:|javascript:)/i;

const report = {
  ok: true,
  checkedAt: new Date().toISOString(),
  totals: {},
  errors: [],
  warnings: [],
};

function fail(message) {
  report.ok = false;
  report.errors.push(message);
}

function warn(message) {
  report.warnings.push(message);
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${relativePath}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return [];
  }
}

function extractLinks(html) {
  const links = [];
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attributePattern.exec(html))) {
    links.push(match[1]);
  }
  return links;
}

function isIgnorableLink(link) {
  return !link ||
    link.startsWith("#") ||
    allowedExternalSchemes.test(link) ||
    link.startsWith("{{") ||
    link.startsWith("{%");
}

function validateRelativeLink(sourceFile, link, options = {}) {
  if (isIgnorableLink(link)) return;
  if (options.allowImmutableCloudflareArtifacts && link.startsWith("/cdn-cgi/")) {
    warn(`Immutable Cloudflare artifact left unchanged in ${path.relative(repoRoot, sourceFile)}: ${link}`);
    return;
  }
  if (link.startsWith("/") || /^[a-z]+:\/\//i.test(link)) {
    fail(`Non-relative internal link in ${path.relative(repoRoot, sourceFile)}: ${link}`);
    return;
  }

  const cleanLink = link.split("#")[0].split("?")[0];
  if (!cleanLink) return;
  const target = path.resolve(path.dirname(sourceFile), cleanLink);
  if (!target.startsWith(repoRoot)) {
    fail(`Internal link escapes repository in ${path.relative(repoRoot, sourceFile)}: ${link}`);
    return;
  }
  if (!fs.existsSync(target)) {
    fail(`Broken internal link in ${path.relative(repoRoot, sourceFile)}: ${link}`);
  }
}

const topics = readJson("assets/data/topics.json");
const videos = readJson("assets/data/videos.json");
const checksums = readJson("assets/data/tutorial-checksums.json");
const tutorialFiles = walk(tutorialsRoot)
  .filter((file) => file.toLowerCase().endsWith(".html"))
  .map((file) => path.relative(repoRoot, file).split(path.sep).join("/"))
  .sort();

report.totals.topics = topics.length;
report.totals.videos = videos.length;
report.totals.tutorialFiles = tutorialFiles.length;
report.totals.checksums = checksums.length;

const topicPaths = new Set();
const topicNumbers = new Map();
const validCategories = new Set(["Graphs", "Paradigms", "Data Structures", "Geometry"]);

for (const topic of topics) {
  if (!topic.category || !validCategories.has(topic.category)) fail(`Missing or invalid category for topic ${topic.id}`);
  if (!topic.path || !fs.existsSync(path.join(repoRoot, topic.path))) fail(`Topic path does not exist: ${topic.path}`);
  if (!topic.wrapperPath || !fs.existsSync(path.join(repoRoot, topic.wrapperPath))) fail(`Wrapper path does not exist: ${topic.wrapperPath}`);
  if (topicPaths.has(topic.path)) fail(`Duplicate topic path in topics.json: ${topic.path}`);
  topicPaths.add(topic.path);

  if (topicNumbers.has(topic.number)) {
    fail(`Duplicate topic number ${topic.number}: ${topicNumbers.get(topic.number)} and ${topic.id}`);
  }
  topicNumbers.set(topic.number, topic.id);
}

for (const file of tutorialFiles) {
  if (!topicPaths.has(file)) fail(`Tutorial file missing from topics.json: ${file}`);
}

for (const topic of topics) {
  if (!tutorialFiles.includes(topic.path)) fail(`topics.json points to a non-tutorial file: ${topic.path}`);
}

for (const video of videos) {
  if (!/^https:\/\/youtu\.be\/[A-Za-z0-9_-]+$/.test(video.url || "")) {
    fail(`Invalid video URL format: ${video.url}`);
  }
}

const checksumByPath = new Map(checksums.map((entry) => [entry.finalPath, entry]));
for (const file of tutorialFiles) {
  const checksum = checksumByPath.get(file);
  if (!checksum) {
    fail(`Missing checksum entry for tutorial file: ${file}`);
    continue;
  }
  const actual = sha256(path.join(repoRoot, file));
  if (actual !== checksum.sha256) {
    fail(`Tutorial content changed after import: ${file}`);
  }
}

for (const checksum of checksums) {
  if (!fs.existsSync(path.join(repoRoot, checksum.finalPath))) {
    fail(`Checksum references missing tutorial file: ${checksum.finalPath}`);
  }
}

const generatedHtmlFiles = [
  "index.html",
  "topics.html",
  "videos.html",
  "about.html",
  "roadmap.html",
  "404.html",
  ...walk(path.join(repoRoot, "learn")).filter((file) => file.endsWith(".html")).map((file) => path.relative(repoRoot, file).split(path.sep).join("/")),
];

for (const relativeFile of generatedHtmlFiles) {
  const fullPath = path.join(repoRoot, relativeFile);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing generated page: ${relativeFile}`);
    continue;
  }
  const html = fs.readFileSync(fullPath, "utf8");
  for (const link of extractLinks(html)) validateRelativeLink(fullPath, link);
}

for (const relativeFile of tutorialFiles) {
  const fullPath = path.join(repoRoot, relativeFile);
  const html = fs.readFileSync(fullPath, "utf8");
  for (const link of extractLinks(html)) {
    validateRelativeLink(fullPath, link, { allowImmutableCloudflareArtifacts: true });
  }
}

const matchedVideoUrls = new Set(topics.filter((topic) => topic.hasVideo).map((topic) => topic.videoUrl));
for (const video of videos) {
  if (!matchedVideoUrls.has(video.url)) warn(`Video not matched to a topic: ${video.title}`);
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (report.ok) {
  console.log("Validation passed.");
  console.log(`Topics: ${report.totals.topics}`);
  console.log(`Tutorial HTML files: ${report.totals.tutorialFiles}`);
  console.log(`Video links: ${report.totals.videos}`);
  console.log(`Checksum entries: ${report.totals.checksums}`);
  if (report.warnings.length) {
    console.log(`Warnings: ${report.warnings.length}`);
    report.warnings.forEach((message) => console.log(`- ${message}`));
  }
  console.log(`Report written to ${path.relative(repoRoot, reportPath)}.`);
} else {
  console.error("Validation failed.");
  report.errors.forEach((message) => console.error(`- ${message}`));
  console.error(`Report written to ${path.relative(repoRoot, reportPath)}.`);
  process.exit(1);
}
