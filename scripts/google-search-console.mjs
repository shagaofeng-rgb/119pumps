import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const property = "sc-domain:119pumps.com";
const sitemapUrl = "https://119pumps.com/sitemap.xml";
const credentialsPath = resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || ".secrets/google-search-console.json",
);

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function accessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    encode({ alg: "RS256", typ: "JWT" }),
    encode({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/webmasters",
      aud: credentials.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  ].join(".");
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(credentials.private_key, "base64url")}`;
  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth rejected the credentials (HTTP ${response.status}).`);
  const token = await response.json();
  if (!token.access_token) throw new Error("Google OAuth did not return an access token.");
  return token.access_token;
}

async function main() {
  if (!process.argv.slice(2).every((arg) => ["--check", "--submit"].includes(arg))) {
    throw new Error("Usage: node scripts/google-search-console.mjs [--check|--submit]");
  }

  const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  if (credentials.type !== "service_account" || !credentials.client_email || !credentials.private_key) {
    throw new Error("Expected a Google service account JSON file.");
  }
  const token = await accessToken(credentials);
  const headers = { Authorization: `Bearer ${token}` };
  const sitesResponse = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers });
  if (!sitesResponse.ok) throw new Error(`Search Console API site check failed (HTTP ${sitesResponse.status}).`);
  const sites = await sitesResponse.json();
  const site = sites.siteEntry?.find((entry) => entry.siteUrl === property);
  if (!site || !["siteOwner", "siteFullUser"].includes(site.permissionLevel)) {
    throw new Error(`Grant ${credentials.client_email} Full user access to ${property} in Search Console, then retry.`);
  }
  console.log(`Search Console access confirmed: ${property} (${site.permissionLevel}).`);

  if (!process.argv.includes("--submit")) return;
  let sitemapResponse;
  try {
    sitemapResponse = await fetch(sitemapUrl);
  } catch {
    throw new Error(`Cannot reach ${sitemapUrl}. Check the domain's DNS and Vercel domain settings.`);
  }
  if (!sitemapResponse.ok) throw new Error(`The public sitemap is unavailable (HTTP ${sitemapResponse.status}).`);
  const sitemap = await sitemapResponse.text();
  if (!sitemap.includes("<urlset") || !sitemap.includes("https://119pumps.com/")) {
    throw new Error("The public sitemap does not contain 119pumps.com URLs.");
  }
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, { method: "PUT", headers });
  if (!response.ok) throw new Error(`Sitemap submission failed (HTTP ${response.status}).`);
  console.log(`Sitemap submitted: ${sitemapUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
