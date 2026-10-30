import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function record(condition, message) {
  checks.push({ message, passed: Boolean(condition) });
  if (!condition) failures.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function resolveLocalPath(fromFile, rawTarget) {
  const cleanTarget = decodeURIComponent(rawTarget.split(/[?#]/, 1)[0]);
  if (!cleanTarget) return fromFile;
  if (cleanTarget.startsWith("/")) return path.join(root, cleanTarget.replace(/^\/+/, ""));
  return path.resolve(root, path.dirname(fromFile), cleanTarget);
}

function isInsideRoot(filePath) {
  const relative = path.relative(root, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function collectMarkdownFiles(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) results.push(fullPath);
  }
  return results;
}

const requiredFiles = [
  "README.md", "index.html", "styles.css", "CLAIMS.md",
  "BENCHMARK_G1.md", "SECURITY.md", "docs/README.md",
  "docs/SECURITY_MODEL.md", "docs/REPOSITORY_MAINTENANCE.md",
  "scripts/validate-public-repo.mjs",
];
for (const relativePath of requiredFiles) {
  record(fs.existsSync(path.join(root, relativePath)), `Required file exists: ${relativePath}`);
}

const markdownFiles = collectMarkdownFiles(root);
let markdownLinkCount = 0;
for (const absolutePath of markdownFiles) {
  const relativePath = path.relative(root, absolutePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().split(/\s+/, 1)[0];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(rawTarget)) continue;
    markdownLinkCount += 1;
    const resolved = resolveLocalPath(relativePath, rawTarget);
    record(isInsideRoot(resolved) && fs.existsSync(resolved), `Local Markdown reference resolves: ${relativePath} -> ${rawTarget}`);
  }
}
record(markdownLinkCount > 0, "Markdown local references were inspected");

const html = read("index.html");
const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
let htmlReferenceCount = 0;
for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
  const target = match[1].trim();
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(target)) continue;
  if (target.startsWith("#")) {
    const id = target.slice(1);
    record(ids.has(id), `HTML fragment target exists: #${id}`);
    htmlReferenceCount += 1;
    continue;
  }
  const resolved = resolveLocalPath("index.html", target);
  record(isInsideRoot(resolved) && fs.existsSync(resolved), `Local HTML reference resolves: ${target}`);
  htmlReferenceCount += 1;
}
record(htmlReferenceCount > 0, "HTML local references were inspected");

record(/<title>[^<]+<\/title>/i.test(html), "HTML title is present");
record(/<meta name="description" content="[^"]{40,180}"/i.test(html), "Meta description is present and within the preferred length range");
record(/<link rel="canonical" href="https:\/\//i.test(html), "Canonical URL is present");
record(/property="og:title"/i.test(html) && /property="og:description"/i.test(html), "Open Graph title and description are present");
record(/name="twitter:card" content="summary_large_image"/i.test(html) && /name="twitter:image"/i.test(html), "Large-image social metadata is present");
record(/<a class="skip-link" href="#top">Skip to main content<\/a>/.test(html), "Keyboard skip-to-content link is present");

const css = read("styles.css");
record(/:focus-visible/.test(css), "Visible keyboard focus styles are present");
record(/prefers-reduced-motion:\s*reduce/.test(css), "Reduced-motion styles are present");

const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
let structuredDataValid = false;
if (jsonLdMatch) {
  try {
    const parsed = JSON.parse(jsonLdMatch[1]);
    const graph = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
    const types = graph.map((entry) => entry["@type"]).flat();
    structuredDataValid = types.includes("Organization") && types.includes("WebSite") && types.includes("SoftwareApplication");
    record(!/"(?:aggregateRating|review|ratingValue)"/i.test(JSON.stringify(parsed)), "Structured data contains no ratings or reviews");
  } catch (error) {
    failures.push(`Structured data JSON is valid: ${error.message}`);
  }
}
record(structuredDataValid, "Structured data identifies publisher, website, and product");

const marketingFiles = [["README.md", read("README.md")], ["index.html", html]];
const withdrawnScorePattern = /\b(?:39\s*\/\s*51|41\s*\/\s*42|97\.6\s*%)\b/;
for (const [label, content] of marketingFiles) record(!withdrawnScorePattern.test(content), `No withdrawn G1 score appears in marketing surface: ${label}`);
record(!withdrawnScorePattern.test(read("BENCHMARK_G1.md")), "Withdrawn G1 score is not repeated in the current benchmark page");

for (const file of markdownFiles) {
  const text = fs.readFileSync(file, "utf8");
  record(!/\b(?:TODO|FIXME|Lorem ipsum)\b/i.test(text), `No unresolved drafting marker: ${path.relative(root, file)}`);
}

const failedChecks = checks.filter((check) => !check.passed);
console.log(`VulnGPT public repository validation: ${failedChecks.length ? "FAILED" : "PASSED"}`);
console.log(`${checks.length - failedChecks.length}/${checks.length} checks passed; ${markdownFiles.length} Markdown files inspected.`);
if (failedChecks.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
