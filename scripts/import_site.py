"""Import public pages into portable, brand-neutral site data.

Usage: python scripts/import_site.py BASE_URL --remove-term TERM [--remove-term TERM ...]
The source address and removal terms are CLI inputs so they are never stored in the app.
"""

import argparse
import concurrent.futures
import hashlib
import json
import re
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

import requests
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
ASSETS = ROOT / "public" / "assets"


def fetch(session, url):
    for attempt in range(3):
        try:
            response = session.get(url, timeout=25)
            if response.status_code == 200:
                return response
        except requests.RequestException:
            pass
        time.sleep(attempt + 1)
    return None


def normalize(url, origin):
    parsed = urllib.parse.urlparse(urllib.parse.urljoin(origin, url))
    host = urllib.parse.urlparse(origin).netloc
    if parsed.netloc != host or parsed.scheme not in ("http", "https"):
        return None
    path = urllib.parse.unquote(parsed.path or "/")
    if path.endswith("/index.html"):
        path = path[:-10]
    if not path.startswith("/"):
        path = "/" + path
    if re.search(r"\.(jpg|jpeg|png|gif|webp|svg|pdf|css|js|zip|mp4|ico)$", path, re.I):
        return None
    return path


def classify(path):
    if path == "/": return "home"
    if path.startswith(("/products/", "/fire-pump-system/")):
        return "product" if path.endswith(".html") else "product-list"
    if path.startswith(("/industry-news/", "/company-news/")):
        return "article" if path.endswith(".html") else "news-list"
    if path.startswith("/faq/"):
        return "faq" if path.endswith(".html") else "faq-list"
    if path.startswith("/application/"):
        return "case" if path.endswith(".html") else "case-list"
    return "static"


def clean_string(value, terms):
    value = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "", value)
    value = re.sub(r"(?:\+?86[-\s]?)?1[3-9]\d{9}", "", value)
    value = re.sub(r"(?:0086|\+86)[-\s]?\d{2,4}[-\s]?\d{6,8}", "", value)
    value = re.sub(r"\b\d{3,4}[-\s]\d{7,8}\b", "", value)
    for term in sorted(terms, key=len, reverse=True):
        value = re.sub(re.escape(term), "", value, flags=re.I)
    return re.sub(r" {2,}", " ", value).strip()


def sanitize(soup, origin, terms, image_urls):
    for bad in soup.select("script, iframe, noscript, style, .whatsapp_float, .remarketingsetup, .gaga"):
        bad.decompose()
    for form in soup.select("form"):
        placeholder = soup.new_tag("div", attrs={"class": "pending-form"})
        placeholder.string = "Inquiry form · contact details pending"
        form.replace_with(placeholder)
    for tag in list(soup.find_all(True)):
        for attr in list(tag.attrs):
            if attr.startswith("on") or attr in ("srcset", "data-original", "data-src"):
                del tag.attrs[attr]
        for attr in ("title", "alt", "placeholder", "value"):
            if tag.has_attr(attr):
                tag[attr] = clean_string(str(tag[attr]), terms)
        if tag.has_attr("style"):
            style = str(tag["style"])
            if "url(" in style or any(t.lower() in style.lower() for t in terms):
                del tag["style"]
        if tag.name == "a":
            href = tag.get("href", "")
            target = normalize(href, origin)
            tag["href"] = target or "#"
            tag.attrs.pop("target", None)
        if tag.name == "img":
            src = tag.get("src", "")
            full = urllib.parse.urljoin(origin, src)
            parsed = urllib.parse.urlparse(full)
            if parsed.netloc == urllib.parse.urlparse(origin).netloc and src:
                image_urls.add(full)
                tag["src"] = "/assets/" + hashlib.sha256(full.encode()).hexdigest()[:20] + Path(parsed.path).suffix.lower()
                tag["loading"] = "lazy"
            else:
                tag.decompose()
        if tag.name in ("video", "source"):
            tag.decompose()
    for node in soup.find_all(string=True):
        if isinstance(node, NavigableString) and node.parent and node.parent.name not in ("script", "style"):
            node.replace_with(clean_string(str(node), terms))
    return str(soup)


def parse_page(path, origin, terms):
    session = requests.Session()
    session.headers["User-Agent"] = "Mozilla/5.0 (compatible; SiteMigration/1.0)"
    url = urllib.parse.urljoin(origin, path.lstrip("/"))
    response = fetch(session, url)
    if not response:
        return path, None, set(), set()
    soup = BeautifulSoup(response.content, "html.parser")
    discovered = set()
    for anchor in soup.find_all("a", href=True):
        new_path = normalize(anchor["href"], origin)
        if new_path and not new_path.startswith(("/e/", "/d/")):
            discovered.add(new_path)
    main = soup.select_one(".center") if path == "/" else soup.select_one(".content")
    if not main:
        main = soup.select_one("main") or soup.body
    # Keep the page's original content structure and classes; replace its shared chrome.
    main = BeautifulSoup(str(main), "html.parser")
    images = set()
    html = sanitize(main, origin, terms, images)
    title = clean_string(soup.title.get_text(" ", strip=True) if soup.title else path, terms)
    description = soup.find("meta", attrs={"name": "description"})
    description = clean_string(description.get("content", "") if description else "", terms)
    return path, {"path": path, "type": classify(path), "title": title, "description": description, "html": html}, discovered, images


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("origin")
    parser.add_argument("--remove-term", action="append", default=[])
    parser.add_argument("--limit", type=int, default=1200)
    args = parser.parse_args()
    origin = args.origin.rstrip("/") + "/"
    session = requests.Session()
    site_map = fetch(session, urllib.parse.urljoin(origin, "sitemap.xml"))
    if not site_map:
        sys.exit("Could not fetch sitemap")
    tree = ET.fromstring(site_map.content)
    paths = {normalize(el.text, origin) for el in tree.iter() if el.tag.endswith("loc") and el.text}
    paths.discard(None)
    paths.update({"/", "/contact.html", "/company-profile.html", "/service.html", "/site-index.html", "/product-index.html", "/shopping-guide.html", "/method-of-payment.html", "/service-guarantee.html"})
    existing = DATA / "site.json"
    pages = json.loads(existing.read_text(encoding="utf-8")) if existing.exists() else {}
    all_images = set()
    done = set(pages)
    for page in pages.values():
        saved = BeautifulSoup(page["html"], "html.parser")
        for anchor in saved.find_all("a", href=True):
            found = normalize(anchor["href"], origin)
            if found:
                paths.add(found)
    while paths - done and len(done) < args.limit:
        batch = sorted(paths - done)[: min(100, args.limit - len(done))]
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda p: parse_page(p, origin, args.remove_term), batch))
        for path, data, discovered, images in results:
            done.add(path)
            if data: pages[path] = data
            paths.update(discovered)
            all_images.update(images)
        print(f"pages {len(done)}/{len(paths)} parsed; assets {len(all_images)}", flush=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    def save_image(url):
        parsed = urllib.parse.urlparse(url)
        ext = Path(parsed.path).suffix.lower()
        target = ASSETS / (hashlib.sha256(url.encode()).hexdigest()[:20] + ext)
        if target.exists():
            return True
        try:
            response = requests.get(url, timeout=12)
        except requests.RequestException:
            return False
        if response.status_code != 200 or not response.headers.get("content-type", "").startswith("image/"):
            return False
        target.write_bytes(response.content)
        return True
    # Save the page archive before image downloads so a slow asset cannot delay local use.
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / "site.json").write_text(json.dumps(pages, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with concurrent.futures.ThreadPoolExecutor(max_workers=14) as pool:
        results = list(pool.map(save_image, sorted(all_images)))
    print(f"saved {len(pages)} pages, {sum(results)}/{len(all_images)} images", flush=True)


if __name__ == "__main__":
    main()
