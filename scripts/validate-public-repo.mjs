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
  "README.md", "index.html", "styles.css", "product/index.html", "404.html", "CLAIMS.md", "LICENSE", "CODEOWNERS",
  "CHANGELOG.md", "SUPPORT.md", "BENCHMARK_G1.md", "SECURITY.md",
  "docs/README.md", "docs/SECURITY_MODEL.md", "docs/REPOSITORY_MAINTENANCE.md",
  ".well-known/security.txt",
  "docs/SECURITY_TESTING_PLAYBOOK.md", "docs/CAPABILITY_EVALUATION_MATRIX.md",
  "docs/index.html", "docs/docs.css", "docs/docs.js", "docs/SYSTEM_OVERVIEW.md", "docs/EVALUATION_PROTOCOL.md",
  "schemas/README.md", "schemas/finding-record.schema.json", "schemas/benchmark-report.schema.json",
  "docs/ASSESSMENT_PLAN_TEMPLATE.md", "docs/FINDING_REPORT_STANDARD.md",
  "docs/BENCHMARK_GOVERNANCE.md", "docs/GLOSSARY.md", "docs/RELEASE_PROCESS.md",
  "templates/assessment-plan.md", "templates/finding-report.md",
  ".github/PULL_REQUEST_TEMPLATE.md", ".github/RELEASE_TEMPLATE.md",
  "scripts/validate-public-repo.mjs",
];
for (const relativePath of requiredFiles) {
  record(fs.existsSync(path.join(root, relativePath)), `Required file exists: ${relativePath}`);
}
for (const assetPath of ["assets/dashboard.png", "assets/findings.png", "assets/bola finding.png", "assets/live vision.png", "assets/elte red team report.png"]) {
  record(fs.existsSync(path.join(root, assetPath)), "Product screenshot exists: " + assetPath);
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
record(fs.existsSync(path.join(root, "templates/finding-report.md")) && fs.existsSync(path.join(root, "templates/assessment-plan.md")), "Reusable assessment and finding templates are present");

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

const docsHtml = read("docs/index.html");
const docsIds = new Set([...docsHtml.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
let docsHtmlReferenceCount = 0;
for (const match of docsHtml.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
  const target = match[1].trim();
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(target)) continue;
  if (target.startsWith("#")) {
    record(docsIds.has(target.slice(1)), "Documentation HTML fragment exists: " + target);
  } else {
    const resolved = resolveLocalPath("docs/index.html", target);
    record(isInsideRoot(resolved) && fs.existsSync(resolved), "Documentation local asset resolves: " + target);
  }
  docsHtmlReferenceCount += 1;
}
record(docsHtmlReferenceCount > 0, "Documentation portal local references were inspected");
record(/<link rel="canonical" href="https:\/\//i.test(docsHtml), "Documentation portal canonical URL is present");
record(docsHtml.includes('class="skip-link" href="#main"'), "Documentation portal skip link is present");
record(docsHtml.includes('id="doc-search"') && docsHtml.includes('data-filter="all"'), "Documentation portal search and filters are present");

record(docsHtml.split('class="doc-card"').length - 1 >= 20, "Documentation portal includes a useful searchable document catalogue");
record(docsHtml.includes('name="twitter:title"') && docsHtml.includes('name="twitter:image"'), "Documentation portal social metadata is present");

const docsCss = read("docs/docs.css");
const docsJs = read("docs/docs.js");
record(docsCss.includes(":focus-visible") && docsCss.includes("prefers-reduced-motion:reduce"), "Documentation portal focus and reduced-motion styles are present");
record(docsJs.includes("applyFilters") && docsJs.includes("aria-pressed"), "Documentation search and filter behavior is wired");

const docsStructuredData = docsHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
let docsStructuredDataValid = false;
if (docsStructuredData) {
  try {
    const parsed = JSON.parse(docsStructuredData[1]);
    docsStructuredDataValid = parsed["@type"] === "CollectionPage" && parsed.name === "VulnGPT Documentation";
  } catch (error) {
    failures.push("Documentation structured data is valid JSON: " + error.message);
  }
}
record(docsStructuredDataValid, "Documentation structured data identifies the documentation collection");

for (const schemaPath of ["schemas/finding-record.schema.json", "schemas/benchmark-report.schema.json"]) {
  try {
    const schema = JSON.parse(read(schemaPath));
    record(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "JSON Schema draft is declared: " + schemaPath);
    record(schema.type === "object" && Array.isArray(schema.required) && schema.required.length > 0, "JSON Schema contract and required fields exist: " + schemaPath);
    record(typeof schema.title === "string" && schema.title.length > 0, "JSON Schema title exists: " + schemaPath);
  } catch (error) {
    failures.push("JSON Schema parses: " + schemaPath + " — " + error.message);
  }
}

const securityTxt = read(".well-known/security.txt");
const securityExpiryLine = securityTxt.split("\n").find((line) => line.startsWith("Expires:"));
const securityExpiry = securityExpiryLine ? Date.parse(securityExpiryLine.slice("Expires:".length).trim()) : Number.NaN;
record(securityTxt.includes("Contact: mailto:hello@novaseclabs.com"), "security.txt has a public security contact");
record(securityTxt.includes("Policy: https://github.com/abdallahyasser12/vulngpt-showcase/blob/main/SECURITY.md"), "security.txt points to the authoritative policy");
record(securityTxt.includes("Canonical: https://showcase.novaseclabs.com/.well-known/security.txt"), "security.txt canonical URL uses the branded showcase hostname");
record(Number.isFinite(securityExpiry) && securityExpiry > Date.now(), "security.txt expiry is in the future");


const productHtml = read("product/index.html");
record(productHtml.includes("<title>Product walkthrough | VulnGPT</title>"), "Product walkthrough title is present");
record(productHtml.includes('href="https://showcase.novaseclabs.com/product/"'), "Product walkthrough canonical URL is present");
record(productHtml.includes('id="image-viewer"') && productHtml.includes("viewer.showModal()"), "Product screenshot lightbox has a native dialog and wired controls");
record(productHtml.includes("data-lightbox") && productHtml.includes("disabled by effective export policy"), "Product walkthrough links captures and preserves export-policy caveat");
record(html.includes('href="https://showcase.novaseclabs.com/"'), "Homepage canonical URL uses branded showcase hostname");
const docsPortalHtml = read("docs/index.html");
record(docsPortalHtml.includes('href="https://showcase.novaseclabs.com/docs/"'), "Documentation canonical URL uses branded showcase hostname");
record(read("robots.txt").includes("https://showcase.novaseclabs.com/sitemap.xml"), "Robots file references the branded sitemap");
record(read("sitemap.xml").includes("https://showcase.novaseclabs.com/product/"), "Sitemap includes product walkthrough on branded hostname");
const notFoundHtml = read("404.html");
record(notFoundHtml.includes('href="/product/"') && notFoundHtml.includes('href="/docs/"'), "Custom 404 page provides useful navigation");
record(productHtml.includes('href="/assets/dashboard.png"') && productHtml.includes('href="/assets/findings.png"') && productHtml.includes('href="/assets/live%20vision.png"'), "Product walkthrough links to original interface captures");
record(productHtml.includes("static screenshots, not a live product session") && productHtml.includes("disabled by effective export policy"), "Product walkthrough preserves screenshot-state and export-policy caveats");

const failedChecks = checks.filter((check) => !check.passed);
console.log(`VulnGPT public repository validation: ${failedChecks.length ? "FAILED" : "PASSED"}`);
console.log(`${checks.length - failedChecks.length}/${checks.length} checks passed; ${markdownFiles.length} Markdown files inspected.`);
if (failedChecks.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
