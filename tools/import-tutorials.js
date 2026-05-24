#!/usr/bin/env node

const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const zipPath = path.resolve(process.argv[2] || "/Users/cewatlac/Downloads/HTML.zip");
const tutorialsRoot = path.join(repoRoot, "tutorials");
const checksumPath = path.join(repoRoot, "assets", "data", "tutorial-checksums.json");

const categoryMap = new Map([
  ["graphs", { label: "Graphs", slug: "graphs" }],
  ["paradigms", { label: "Paradigms", slug: "paradigms" }],
  ["data structures", { label: "Data Structures", slug: "data-structures" }],
  ["geometry", { label: "Geometry", slug: "geometry" }],
]);

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

function cleanTutorialDirs() {
  for (const { slug } of categoryMap.values()) {
    fs.rmSync(path.join(tutorialsRoot, slug), { recursive: true, force: true });
    fs.mkdirSync(path.join(tutorialsRoot, slug), { recursive: true });
  }
}

function getCategory(relativePath) {
  const parts = relativePath.split(path.sep).map((part) => part.toLowerCase());
  const categoryName = parts.find((part) => categoryMap.has(part));
  if (!categoryName) {
    throw new Error(`Could not infer category for ${relativePath}`);
  }
  return categoryMap.get(categoryName);
}

if (!fs.existsSync(zipPath)) {
  throw new Error(`ZIP file not found: ${zipPath}`);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "senior2026-html-"));
try {
  childProcess.execFileSync("unzip", ["-q", zipPath, "-d", tempDir], { stdio: "ignore" });
  const sourceRoot = path.join(tempDir, "HTML");
  if (!fs.existsSync(sourceRoot)) {
    throw new Error("The ZIP does not contain the expected HTML/ folder.");
  }

  cleanTutorialDirs();

  const htmlFiles = walk(sourceRoot)
    .filter((file) => file.toLowerCase().endsWith(".html"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const seenDestinations = new Set();
  const checksums = htmlFiles.map((sourceFile) => {
    const relativeSourcePath = path.relative(sourceRoot, sourceFile);
    const category = getCategory(relativeSourcePath);
    const finalFileName = path.basename(sourceFile);
    const destination = path.join(tutorialsRoot, category.slug, finalFileName);
    const relativeDestination = path.relative(repoRoot, destination).split(path.sep).join("/");

    if (seenDestinations.has(relativeDestination)) {
      throw new Error(`Duplicate destination detected: ${relativeDestination}`);
    }
    seenDestinations.add(relativeDestination);

    fs.copyFileSync(sourceFile, destination);
    const sourceHash = sha256(sourceFile);
    const destinationHash = sha256(destination);
    if (sourceHash !== destinationHash) {
      throw new Error(`Checksum mismatch while importing ${relativeSourcePath}`);
    }

    return {
      sourceZip: zipPath,
      originalPath: relativeSourcePath.split(path.sep).join("/"),
      originalFileName: finalFileName,
      finalPath: relativeDestination,
      category: category.label,
      sha256: sourceHash,
      bytes: fs.statSync(destination).size,
    };
  });

  fs.mkdirSync(path.dirname(checksumPath), { recursive: true });
  fs.writeFileSync(checksumPath, `${JSON.stringify(checksums, null, 2)}\n`);
  console.log(`Imported ${checksums.length} tutorial HTML files without content changes.`);
  console.log(`Wrote ${path.relative(repoRoot, checksumPath)}.`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
