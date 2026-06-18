#!/usr/bin/env python3
"""Check that an English post is in structural sync with its Vietnamese source.

Compares the fields that must be identical across locales (date, tags,
enableComment) plus the set of ExcalidrawDiagram `src` references. Prose,
title, and description legitimately differ between locales and are not checked.

Usage:
    check_parity.py                # scan every vi/en post pair
    check_parity.py learn-security-group aws-caching-strategies
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
VI_DIR = REPO_ROOT / "content" / "vi" / "posts"
EN_DIR = REPO_ROOT / "content" / "en" / "posts"

DIAGRAM_SRC = re.compile(r'<ExcalidrawDiagram[^>]*\bsrc=\s*["\']([^"\']+)["\']')


def read_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    block = text[3:end]
    fields = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields, text


def normalize_tags(raw):
    if raw is None:
        return None
    items = re.findall(r"['\"]([^'\"]+)['\"]", raw)
    return sorted(items)


def diagram_srcs(text):
    return sorted(set(DIAGRAM_SRC.findall(text)))


def check(slug):
    vi_path = VI_DIR / f"{slug}.mdx"
    en_path = EN_DIR / f"{slug}.mdx"
    issues = []

    if not vi_path.exists():
        return [f"Vietnamese source missing: {vi_path.relative_to(REPO_ROOT)}"]
    if not en_path.exists():
        return [f"English post does not exist yet: {en_path.relative_to(REPO_ROOT)} (create it via blog-writer)"]

    vi_fm, vi_text = read_frontmatter(vi_path.read_text(encoding="utf-8"))
    en_fm, en_text = read_frontmatter(en_path.read_text(encoding="utf-8"))

    for field in ("date", "enableComment"):
        if vi_fm.get(field) != en_fm.get(field):
            issues.append(f"{field} mismatch: vi={vi_fm.get(field)!r} en={en_fm.get(field)!r}")

    if normalize_tags(vi_fm.get("tags")) != normalize_tags(en_fm.get("tags")):
        issues.append(f"tags mismatch: vi={vi_fm.get('tags')} en={en_fm.get('tags')}")

    vi_diagrams, en_diagrams = diagram_srcs(vi_text), diagram_srcs(en_text)
    if vi_diagrams != en_diagrams:
        only_vi = [d for d in vi_diagrams if d not in en_diagrams]
        only_en = [d for d in en_diagrams if d not in vi_diagrams]
        if only_vi:
            issues.append(f"diagram(s) in vi but not en: {only_vi}")
        if only_en:
            issues.append(f"diagram(s) in en but not vi: {only_en}")

    return issues


def main():
    slugs = sys.argv[1:]
    if not slugs:
        slugs = sorted(p.stem for p in VI_DIR.glob("*.mdx"))

    failures = 0
    for slug in slugs:
        issues = check(slug)
        if issues:
            failures += 1
            print(f"✗ {slug}")
            for issue in issues:
                print(f"    {issue}")
        else:
            print(f"✓ {slug}")

    print()
    if failures:
        print(f"{failures} post(s) out of sync.")
        sys.exit(1)
    print("All checked posts are in sync.")


if __name__ == "__main__":
    main()
