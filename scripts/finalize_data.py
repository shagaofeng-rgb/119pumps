"""Remove identity-specific content and keep blank replacement modules."""

import argparse
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src" / "data" / "site.json"

CORPORATE_PAGES = {
    "/company-profile.html", "/factory-show/",
    "/customer-witness/", "/certificate/", "/certificate/domestic/",
    "/certificate/international/", "/service.html", "/contact.html",
    "/service-guarantee.html", "/shopping-guide.html",
    "/method-of-payment.html", "/the-contract-sample/", "/video/",
    "/test-video/",
}


def clean(value, terms):
    value = re.sub(r"\[if[^\]]*\]|\[endif\]", "", value, flags=re.I)
    value = re.sub(r"\bco\.?\s*,?\s*ltd\.?", "", value, flags=re.I)
    value = re.sub(r"certificate\s+number\s+[A-Z0-9-]+", "certification details pending", value, flags=re.I)
    value = re.sub(r"\b(?:https?://)?(?:www\.)?[A-Za-z0-9.-]+\.(?:com|cn|ae)(?:/[^\s<>]*)?", "", value, flags=re.I)
    for term in sorted(terms, key=len, reverse=True):
        value = re.sub(re.escape(term), "", value, flags=re.I)
    value = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "", value)
    value = re.sub(r"(?:\+?86[-\s]?)?1[3-9]\d{9}", "", value)
    value = re.sub(r"(?:0086|\+86)[-\s]?\d{2,4}[-\s]?\d{6,8}", "", value)
    value = re.sub(r"\b\d{3,4}[-\s]\d{7,8}\b", "", value)
    return re.sub(r" {2,}", " ", value)


def neutral_path(path, terms):
    embedded_host = re.search(r"/www\.[^/]+(?=/|$)", path)
    if embedded_host:
        path = path[embedded_host.end():] or "/"
    for term in terms:
        path = re.sub(re.escape(term), "", path, flags=re.I)
    path = re.sub(r"-{2,}", "-", path)
    path = re.sub(r"/[-_]+", "/", path)
    path = re.sub(r"[-_]+(?=\.html|/|$)", "", path)
    return re.sub(r"/{2,}", "/", path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--remove-term", action="append", default=[])
    parser.add_argument("--remove-path-term", action="append", default=[])
    args = parser.parse_args()
    pages = {path: page for path, page in json.loads(DATA_FILE.read_text(encoding="utf-8")).items() if not path.startswith("/www.")}
    path_map = {}
    used_paths = set(pages)
    for old in pages:
        new = neutral_path(old, args.remove_path_term)
        if new != old:
            base, suffix = (new[:-5], ".html") if new.endswith(".html") else (new.rstrip("/"), "/" if new.endswith("/") else "")
            candidate = new
            counter = 2
            while candidate in used_paths and candidate != old:
                candidate = f"{base}-{counter}{suffix}"
                counter += 1
            new = candidate
            path_map[old] = new
            used_paths.add(new)
    for old, new in path_map.items():
        page = pages.pop(old)
        page["path"] = new
        pages[new] = page
    for page in pages.values():
        page["title"] = clean(page["title"], args.remove_term).strip(" -|")
        page["description"] = clean(page["description"], args.remove_term).strip()
        path = page["path"]
        if path == "/":
            page["title"] = "Industrial Pump Solutions"
        elif path in CORPORATE_PAGES:
            page["title"] = "Contact Us" if path == "/contact.html" else path.strip("/").split("/")[-1].removesuffix(".html").replace("-", " ").title()
        if path in CORPORATE_PAGES or "history" in path or path.startswith(("/company-news/", "/social-media/")):
            page["html"] = '<section class="identity-content-pending"><h1>New brand content pending</h1></section>'
            continue
        soup = BeautifulSoup(page["html"], "html.parser")
        if path == "/":
            subtitle = soup.select_one(".cbox01 .title p.text")
            if subtitle:
                subtitle.string = "Explore the product range"
            for selector, label in ((".cbox03", "About us"), (".cbox05", "Company highlights")):
                old = soup.select_one(selector)
                if old:
                    new = BeautifulSoup(
                        f'<section class="pending-home-block"><div class="site-wrap"><p>NEW BRAND CONTENT</p><h2>{label}</h2><span>Information to be provided</span></div></section>',
                        "html.parser",
                    )
                    old.replace_with(new)
        for node in soup.find_all(string=True):
            if isinstance(node, NavigableString):
                node.replace_with(clean(str(node), args.remove_term))
        for tag in soup.find_all(True):
            for attr, value in list(tag.attrs.items()):
                if any(term.lower() in attr.lower() for term in args.remove_term):
                    del tag.attrs[attr]
                    continue
                if attr in ("href", "src"):
                    continue
                if isinstance(value, str):
                    tag[attr] = clean(value, args.remove_term)
                elif isinstance(value, list):
                    tag[attr] = [clean(str(item), args.remove_term) for item in value]
            if tag.name == "a":
                label = tag.get_text(" ", strip=True).lower()
                if any(phrase in label for phrase in ("inquiry", "get price", "send e-mail", "send email", "contact us")):
                    tag["href"] = "/contact.html"
            if tag.name == "a" and tag.get("href") in path_map:
                tag["href"] = path_map[tag["href"]]
        page["html"] = str(soup)
    missing = set()
    for page in list(pages.values()):
        soup = BeautifulSoup(page["html"], "html.parser")
        for anchor in soup.find_all("a", href=True):
            href = anchor["href"].split("#", 1)[0].split("?", 1)[0]
            if href.startswith("/"):
                href = neutral_path(href, args.remove_path_term)
                anchor["href"] = href
            if href.startswith("/") and href not in pages and href not in ("/search", "/panorama"):
                missing.add(href)
        page["html"] = str(soup)
    for path in sorted(missing):
        name = clean(path.strip("/").split("/")[-1].removesuffix(".html").replace("-", " ").replace("_", " ").title(), args.remove_term) or "Page"
        pages[path] = {"path": path, "type": "placeholder", "title": name, "description": "", "html": '<section class="identity-content-pending"><h1>Content pending</h1></section>'}
    DATA_FILE.write_text(json.dumps(pages, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"finalized {len(pages)} pages, including {len(missing)} link placeholders")


if __name__ == "__main__":
    main()
