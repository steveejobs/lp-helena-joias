from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


IGNORED_DIRECTORIES = {".git", ".next", ".nuxt", ".cache", ".tmp-preview", "dist", "build", "coverage", "node_modules", "playwright-report", "test-results", "vendor", "venv", ".venv", "__pycache__"}
TEXT_SUFFIXES = {".css", ".html", ".js", ".json", ".jsx", ".md", ".mdx", ".php", ".py", ".rb", ".ts", ".tsx", ".vue", ".yml", ".yaml"}
ROUTE_MARKERS = {"page.tsx", "page.ts", "index.html", "index.tsx", "index.jsx", "route.ts", "route.js"}


def iter_project_files(root: Path) -> list[Path]:
    files: list[Path] = []
    skill_root = Path(__file__).resolve().parents[1]
    for directory, directories, filenames in os.walk(root):
        directories[:] = [name for name in directories if name not in IGNORED_DIRECTORIES]
        directory_path = Path(directory)
        if directory_path == skill_root or skill_root in directory_path.parents:
            directories[:] = []
            continue
        files.extend(directory_path / filename for filename in filenames)
    return sorted(files)


def read_text(path: Path) -> str:
    if path.suffix.lower() not in TEXT_SUFFIXES:
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def first_match(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return match.group(1).strip() if match else None


def unique(values: list[str]) -> list[str]:
    return sorted({value for value in values if value})


def normalize_contact(value: str) -> str:
    value = value.rstrip("`;',\")")
    if value.lower().startswith("https://wa.me/") and "${" in value:
        return "https://wa.me/[configured-number]"
    return value


def discover(root: Path) -> dict[str, Any]:
    files = iter_project_files(root)
    relative = [path.relative_to(root).as_posix() for path in files]
    texts = {path: read_text(path) for path in files}
    package_path = root / "package.json"
    package: dict[str, Any] = {}
    if package_path.exists():
        try:
            package = json.loads(package_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            package = {"_parse_error": "package.json is invalid JSON"}

    route_files = [name for path, name in zip(files, relative) if path.name in ROUTE_MARKERS]
    all_text = "\n".join(texts.values())
    metadata_files = [name for path, name in zip(files, relative) if re.search(r"metadata|generateMetadata|<title|json-ld|canonical", texts[path], re.IGNORECASE)]
    contact_matches = re.findall(r"https?://(?:wa\.me|api\.whatsapp\.com)/[^\s\"'<>]+|(?:mailto:|tel:)[A-Za-z0-9+._@-]+", all_text, re.IGNORECASE)
    location_matches = re.findall(r"(?:addressLocality|addressRegion|streetAddress|postalCode)\s*[:=]\s*[\"']([^\"']+)", all_text, re.IGNORECASE)
    schema_types = re.findall(r"[\"']@type[\"']\s*:\s*[\"']([^\"']+)", all_text)
    public_env = unique(re.findall(r"process\.env\.([A-Z0-9_]*(?:PUBLIC|ANALYTICS|PIXEL)[A-Z0-9_]*)", all_text))

    framework_signals: list[str] = []
    dependencies = package.get("dependencies", {}) if isinstance(package.get("dependencies", {}), dict) else {}
    dev_dependencies = package.get("devDependencies", {}) if isinstance(package.get("devDependencies", {}), dict) else {}
    declared = {**dependencies, **dev_dependencies}
    for name in ("next", "react", "vue", "nuxt", "@angular/core", "svelte", "astro", "django", "flask", "rails", "laravel"):
        if name in declared:
            framework_signals.append(name)
    if (root / "app").exists() and "next" in declared:
        framework_signals.append("next-app-router")

    return {
        "project_root": str(root),
        "project_name": package.get("name") if package else None,
        "project_description": package.get("description") if package else None,
        "framework_signals": unique(framework_signals),
        "scripts": package.get("scripts", {}) if package else {},
        "route_files": route_files,
        "metadata_files": metadata_files,
        "sitemap_present": any("sitemap" in name.lower() for name in relative),
        "robots_present": any("robots" in name.lower() for name in relative),
        "manifest_present": any("manifest" in name.lower() for name in relative),
        "schema_types": unique(schema_types),
        "contact_channels": unique([normalize_contact(match) for match in contact_matches]),
        "location_signals": unique(location_matches),
        "public_environment_variables": public_env,
        "test_files": [name for name in relative if re.search(r"(?:^|/)(?:test|tests|__tests__)/|\.(?:test|spec)\.", name)],
        "content_files": [name for name in relative if Path(name).suffix.lower() in {".md", ".mdx"}],
        "public_assets": [name for name in relative if name.startswith("public/")],
        "file_count": len(files),
        "notes": [
            "Static inventory only. Verify business facts by reading relevant routes, content, and configuration.",
            "Do not infer a business model, locality, or claim solely from filenames or detected strings.",
        ],
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = ["# Project Discovery Inventory", ""]
    for key, value in report.items():
        lines.append(f"## {key.replace('_', ' ').title()}")
        if isinstance(value, list):
            lines.extend(f"- {item}" for item in value) if value else lines.append("- None found.")
        elif isinstance(value, dict):
            lines.extend(f"- `{name}`: {item}" for name, item in sorted(value.items())) if value else lines.append("- None found.")
        else:
            lines.append(str(value) if value else "Not found.")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a deterministic static inventory of a local web project.")
    parser.add_argument("project_root", help="Path to the project root.")
    parser.add_argument("--format", choices=("json", "markdown"), default="json", help="Output format.")
    args = parser.parse_args()
    root = Path(args.project_root).resolve()
    if not root.exists():
        parser.error(f"project root does not exist: {args.project_root}")
    if not root.is_dir():
        parser.error(f"project root is not a directory: {args.project_root}")
    report = discover(root)
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) if args.format == "json" else render_markdown(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
