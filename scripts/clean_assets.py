"""Replace unavailable or flagged image references, then remove unused imports."""

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "site.json"
ASSETS = ROOT / "public" / "assets"
FALLBACK = "/assets/product-placeholder.svg"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--flagged-list", type=Path)
    parser.add_argument("--document-list", type=Path)
    args = parser.parse_args()
    pages = json.loads(DATA.read_text(encoding="utf-8"))
    flagged = set()
    if args.flagged_list and args.flagged_list.exists():
        flagged = {Path(line.strip()).name for line in args.flagged_list.read_text().splitlines() if line.strip()}
    document_flagged = set()
    if args.document_list and args.document_list.exists():
        document_flagged = {Path(line.strip()).name for line in args.document_list.read_text().splitlines() if line.strip()}
        flagged.update(document_flagged)
    replaced = 0
    referenced = set()
    pattern = re.compile(r"/assets/([a-f0-9]{20}(?:\.[A-Za-z0-9]+)?)")
    for page in pages.values():
        candidates = [name for name in pattern.findall(page["html"]) if name not in flagged and (ASSETS / name).exists()]
        page_fallback = "/assets/" + candidates[0] if candidates and page["type"] in ("product", "product-list", "case", "case-list") else FALLBACK
        def replace(match):
            nonlocal replaced
            filename = match.group(1)
            if filename in flagged or not (ASSETS / filename).exists():
                replaced += 1
                if filename in document_flagged:
                    return FALLBACK
                if page_fallback != FALLBACK:
                    referenced.add(page_fallback.removeprefix("/assets/"))
                return page_fallback
            referenced.add(filename)
            return match.group(0)
        page["html"] = pattern.sub(replace, page["html"])
    DATA.write_text(json.dumps(pages, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    removed = 0
    for asset in ASSETS.iterdir():
        if asset.is_file() and asset.name != "product-placeholder.svg" and asset.name not in referenced:
            asset.unlink()
            removed += 1
    print(f"replaced {replaced} image references; kept {len(referenced)} assets; removed {removed} unused assets")


if __name__ == "__main__":
    main()
