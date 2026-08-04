from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


QUESTION_WORDS = ("what", "why", "how", "when", "where", "who", "which", "can", "should", "does", "do", "is", "are", "qual", "como", "por que", "quando", "onde", "quem")


@dataclass
class Link:
    href: str
    text: str
    line: int
    kind: str
    broken: bool = False


@dataclass
class PageData:
    source: str
    html: str
    title: str | None = None
    meta_description: str | None = None
    canonical: str | None = None
    meta_robots: str | None = None
    og: dict[str, str] = field(default_factory=dict)
    twitter: dict[str, str] = field(default_factory=dict)
    lang: str | None = None
    headings: list[dict[str, Any]] = field(default_factory=list)
    images: list[dict[str, Any]] = field(default_factory=list)
    links: list[Link] = field(default_factory=list)
    json_ld: list[dict[str, Any]] = field(default_factory=list)
    json_ld_errors: list[str] = field(default_factory=list)
    text: str = ""
    main_text: str = ""


class SEOHTMLParser(HTMLParser):
    def __init__(self, source: str, html: str) -> None:
        super().__init__(convert_charrefs=True)
        self.page = PageData(source=source, html=html)
        self._tag_stack: list[str] = []
        self._capture_title = False
        self._capture_heading: str | None = None
        self._heading_text: list[str] = []
        self._capture_link: Link | None = None
        self._script_type: str | None = None
        self._script_text: list[str] = []
        self._main_depth = 0
        self._text_parts: list[str] = []
        self._main_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {name.lower(): value or "" for name, value in attrs}
        self._tag_stack.append(tag)
        if tag == "html":
            self.page.lang = attrs_dict.get("lang") or self.page.lang
        elif tag == "title":
            self._capture_title = True
        elif tag == "meta":
            self._handle_meta(attrs_dict)
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            if "canonical" in rel:
                self.page.canonical = attrs_dict.get("href") or self.page.canonical
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._capture_heading = tag
            self._heading_text = []
        elif tag == "img":
            self.page.images.append({"src": attrs_dict.get("src", ""), "alt": attrs_dict.get("alt"), "line": self.getpos()[0]})
        elif tag == "a":
            href = attrs_dict.get("href", "")
            kind = classify_link(href, self.page.source)
            self._capture_link = Link(href=href, text="", line=self.getpos()[0], kind=kind)
        elif tag == "script":
            self._script_type = attrs_dict.get("type", "").lower()
            self._script_text = []
        elif tag == "main":
            self._main_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
        elif self._capture_heading == tag:
            text = clean_text(" ".join(self._heading_text))
            self.page.headings.append({"level": int(tag[1]), "text": text, "line": self.getpos()[0]})
            self._capture_heading = None
            self._heading_text = []
        elif tag == "a" and self._capture_link:
            self._capture_link.text = clean_text(self._capture_link.text)
            self.page.links.append(self._capture_link)
            self._capture_link = None
        elif tag == "script":
            self._handle_script()
            self._script_type = None
            self._script_text = []
        elif tag == "main" and self._main_depth > 0:
            self._main_depth -= 1
        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self.page.title = clean_text((self.page.title or "") + " " + data)
        if self._capture_heading:
            self._heading_text.append(data)
        if self._capture_link:
            self._capture_link.text += " " + data
        if self._script_type == "application/ld+json":
            self._script_text.append(data)
            return
        if self._tag_stack and self._tag_stack[-1] in {"script", "style", "noscript"}:
            return
        text = clean_text(data)
        if text:
            self._text_parts.append(text)
            if self._main_depth > 0:
                self._main_parts.append(text)

    def close(self) -> None:
        super().close()
        self.page.text = clean_text(" ".join(self._text_parts))
        self.page.main_text = clean_text(" ".join(self._main_parts))

    def _handle_meta(self, attrs: dict[str, str]) -> None:
        name = attrs.get("name", "").lower()
        prop = attrs.get("property", "").lower()
        content = attrs.get("content", "")
        if name == "description":
            self.page.meta_description = content
        elif name == "robots":
            self.page.meta_robots = content
        elif prop.startswith("og:"):
            self.page.og[prop] = content
        elif name.startswith("twitter:"):
            self.page.twitter[name] = content

    def _handle_script(self) -> None:
        if self._script_type != "application/ld+json":
            return
        raw = "".join(self._script_text).strip()
        if not raw:
            return
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            self.page.json_ld_errors.append(f"Invalid JSON-LD at line {self.getpos()[0]}: {exc.msg}")
            return
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict):
                self.page.json_ld.append(item)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def classify_link(href: str, source: str) -> str:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return "special"
    parsed = urlparse(href)
    source_parsed = urlparse(source)
    if parsed.scheme in {"http", "https"}:
        if source_parsed.netloc and parsed.netloc != source_parsed.netloc:
            return "external"
        return "internal"
    return "internal"


def load_source(source: str) -> tuple[str, str]:
    parsed = urlparse(source)
    if parsed.scheme in {"http", "https"}:
        request = Request(source, headers={"User-Agent": "seo-ai-visibility/1.0"})
        with urlopen(request, timeout=15) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return source, response.read().decode(charset, errors="replace")
    path = Path(source)
    if not path.exists():
        raise FileNotFoundError(f"Input file does not exist: {source}")
    if not path.is_file():
        raise ValueError(f"Input path is not a file: {source}")
    return str(path.resolve()), path.read_text(encoding="utf-8", errors="replace")


def parse_page(source: str) -> PageData:
    resolved, html = load_source(source)
    parser = SEOHTMLParser(resolved, html)
    parser.feed(html)
    parser.close()
    detect_broken_local_links(parser.page)
    return parser.page


def detect_broken_local_links(page: PageData) -> None:
    parsed_source = urlparse(page.source)
    if parsed_source.scheme in {"http", "https"}:
        return
    base = Path(page.source).parent
    for link in page.links:
        if link.kind != "internal" or not link.href or link.href.startswith("#"):
            continue
        parsed = urlparse(link.href)
        if parsed.scheme or parsed.netloc:
            continue
        target = (base / parsed.path).resolve()
        link.broken = bool(parsed.path and not target.exists())


def schema_types(page: PageData) -> list[str]:
    types: list[str] = []
    for item in page.json_ld:
        collect_schema_types(item, types)
    return types


def collect_schema_types(value: Any, types: list[str]) -> None:
    if isinstance(value, dict):
        raw_type = value.get("@type")
        if isinstance(raw_type, str):
            types.append(raw_type)
        elif isinstance(raw_type, list):
            types.extend(str(item) for item in raw_type)
        for nested in value.values():
            collect_schema_types(nested, types)
    elif isinstance(value, list):
        for item in value:
            collect_schema_types(item, types)


def audit_page(page: PageData) -> dict[str, Any]:
    findings: list[dict[str, Any]] = []

    def add(category: str, problem: str, evidence: str, consequence: str, priority: str, impact: str, effort: str, fix: str, validation: str) -> None:
        findings.append({
            "id": f"SEO-{len(findings) + 1:03d}",
            "category": category,
            "page_file": page.source,
            "problem": problem,
            "evidence": evidence,
            "consequence": consequence,
            "priority": priority,
            "impact": impact,
            "effort": effort,
            "recommended_fix": fix,
            "validation": validation,
        })

    h1s = [h for h in page.headings if h["level"] == 1]
    image_missing_alt = [img for img in page.images if img.get("alt") is None]
    broken_links = [link for link in page.links if link.broken]
    robots = (page.meta_robots or "").lower()
    types = schema_types(page)

    if not page.title:
        add("metadata", "Missing title element", "No <title> text was found.", "Search engines and users lose the primary page label.", "high", "high", "small", "Add a clear title matching the page intent and primary entity.", "Re-run metadata inspection and confirm title is present.")
    if not page.meta_description:
        add("metadata", "Missing meta description", "No meta description was found.", "Search snippets may be less controlled and less aligned with intent.", "medium", "medium", "small", "Add a truthful description that summarizes the page and next step.", "Re-run metadata inspection.")
    if len(h1s) == 0:
        add("structure", "Missing H1", "No H1 heading was found.", "The main page topic is less explicit in HTML.", "high", "high", "small", "Add one visible H1 that states the page's main topic.", "Re-run audit and confirm exactly one primary H1.")
    elif len(h1s) > 1:
        add("structure", "Multiple H1 headings", f"Found {len(h1s)} H1 headings: {', '.join(h['text'] for h in h1s)}", "The page may send mixed topic signals.", "medium", "medium", "small", "Keep one primary H1 and demote secondary headings when appropriate.", "Re-run audit and confirm H1 strategy.")
    if page.meta_robots and "noindex" in robots:
        add("indexation", "Page is marked noindex", f"meta robots content is '{page.meta_robots}'.", "The page is explicitly prevented from being indexed.", "critical", "very_high", "small", "Keep noindex only if intentional; otherwise remove it after evaluating privacy and strategy.", "Inspect final HTML and confirm robots directive.")
    if page.canonical:
        parsed = urlparse(page.canonical)
        source_parsed = urlparse(page.source)
        if parsed.scheme in {"http", "https"} and source_parsed.scheme in {"http", "https"} and parsed.netloc and source_parsed.netloc and parsed.netloc != source_parsed.netloc:
            add("canonical", "Canonical points to another host", f"Canonical is {page.canonical}; source is {page.source}.", "Signals may consolidate to the wrong host or page.", "critical", "very_high", "small", "Set canonical to the preferred equivalent URL for this page.", "Fetch final HTML and verify canonical.")
    else:
        add("canonical", "Missing canonical", "No canonical link was found.", "Duplicate or parameterized URLs may be harder to consolidate.", "medium", "medium", "small", "Add a self-referential canonical for indexable pages.", "Re-run metadata inspection.")
    if image_missing_alt:
        add("accessibility", "Images without alt attribute", f"{len(image_missing_alt)} image(s) have no alt attribute.", "Important visual content may be inaccessible and less understandable.", "medium", "medium", "small", "Add meaningful alt text or empty alt for decorative images.", "Re-run audit and confirm no meaningful image lacks alt.")
    if page.json_ld_errors:
        add("structured_data", "Invalid JSON-LD", "; ".join(page.json_ld_errors), "Structured data may be ignored or fail validation.", "high", "high", "small", "Fix JSON syntax and validate with a structured data parser.", "Run inspect_structured_data.py.")
    duplicate_types = sorted({schema_type for schema_type in types if types.count(schema_type) > 1})
    if duplicate_types:
        add("structured_data", "Duplicate schema types", f"Duplicate @type values: {', '.join(duplicate_types)}.", "Duplicated entities can create conflicting or noisy structured data.", "medium", "medium", "small", "Merge duplicate entities or connect them with stable @id values.", "Run inspect_structured_data.py and inspect entity graph.")
    if "Product" in types and not re.search(r"\b(price|preco|preço|offer|availability|disponivel|disponível)\b", page.text, re.IGNORECASE):
        add("structured_data", "Product schema may be unsupported by visible content", "Product schema was found, but visible text does not mention price, offer, or availability terms.", "Schema should represent visible page content.", "high", "high", "medium", "Either expose truthful product/offer details or remove unsupported Product/Offer properties.", "Compare JSON-LD with visible page content.")
    if broken_links:
        add("links", "Broken local internal links", f"{len(broken_links)} local internal link(s) point to missing files.", "Users and crawlers may hit dead paths.", "high", "high", "small", "Update or remove broken links.", "Run inspect_internal_links.py.")
    if not page.main_text:
        add("rendering", "No content inside main element", "No <main> text was found in the HTML.", "Essential content may be absent from crawler-visible HTML or poorly landmarked.", "high", "high", "medium", "Render primary content in HTML inside a main landmark.", "Inspect final HTML and verify main content is present.")
    if page.headings and any(is_question_heading(h["text"]) for h in page.headings if h["level"] in {2, 3}):
        add("geo_aeo", "Question headings need immediate answer validation", "At least one H2/H3 appears to be a question.", "Answer engines extract better when question headings are followed by direct answers.", "low", "medium", "small", "Ensure the first paragraph after each question heading directly answers it.", "Manually inspect rendered content after heading.")

    summary = {
        "source": page.source,
        "title": page.title,
        "description": page.meta_description,
        "canonical": page.canonical,
        "meta_robots": page.meta_robots,
        "h1_count": len(h1s),
        "image_count": len(page.images),
        "images_missing_alt": len(image_missing_alt),
        "internal_links": len([link for link in page.links if link.kind == "internal"]),
        "external_links": len([link for link in page.links if link.kind == "external"]),
        "broken_internal_links": len(broken_links),
        "json_ld_blocks": len(page.json_ld),
        "json_ld_errors": page.json_ld_errors,
        "schema_types": sorted(set(types)),
        "main_text_present": bool(page.main_text),
    }
    return {"summary": summary, "findings": findings, "actions": group_actions(findings)}


def is_question_heading(text: str) -> bool:
    value = text.strip().lower()
    return value.endswith("?") or any(value.startswith(word + " ") for word in QUESTION_WORDS)


def group_actions(findings: list[dict[str, Any]]) -> dict[str, list[str]]:
    now: list[str] = []
    next_steps: list[str] = []
    later: list[str] = []
    for finding in findings:
        item = f"{finding['id']}: {finding['recommended_fix']}"
        if finding["priority"] in {"critical", "high"} and finding["effort"] == "small":
            now.append(item)
        elif finding["effort"] in {"medium", "large"} or finding["priority"] in {"high", "medium"}:
            next_steps.append(item)
        else:
            later.append(item)
    return {"now": now, "next": next_steps, "later": later}


def page_to_metadata(page: PageData) -> dict[str, Any]:
    return {
        "source": page.source,
        "title": page.title,
        "description": page.meta_description,
        "canonical": page.canonical,
        "meta_robots": page.meta_robots,
        "lang": page.lang,
        "headings": page.headings,
        "images_without_alt": [img for img in page.images if img.get("alt") is None],
        "open_graph": page.og,
        "twitter": page.twitter,
    }


def page_to_structured_data(page: PageData) -> dict[str, Any]:
    types = schema_types(page)
    duplicates = sorted({schema_type for schema_type in types if types.count(schema_type) > 1})
    warnings: list[str] = []
    if "Product" in types and not re.search(r"\b(price|preco|preço|offer|availability|disponivel|disponível)\b", page.text, re.IGNORECASE):
        warnings.append("Product schema appears without visible price, offer, or availability terms.")
    return {
        "source": page.source,
        "json_ld_count": len(page.json_ld),
        "json_ld_errors": page.json_ld_errors,
        "schema_types": sorted(set(types)),
        "duplicate_schema_types": duplicates,
        "warnings": warnings,
        "json_ld": page.json_ld,
    }


def page_to_links(page: PageData) -> dict[str, Any]:
    return {
        "source": page.source,
        "links": [{"href": link.href, "text": link.text, "line": link.line, "kind": link.kind, "broken": link.broken} for link in page.links],
        "broken_internal_links": [{"href": link.href, "line": link.line, "text": link.text} for link in page.links if link.broken],
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = ["# SEO Audit Report", ""]
    summary = report.get("summary", {})
    lines.extend(["## Summary", ""])
    for key, value in summary.items():
        lines.append(f"- **{key}**: {value}")
    lines.extend(["", "## Findings", ""])
    findings = report.get("findings", [])
    if not findings:
        lines.append("No findings detected by the static audit.")
    for finding in findings:
        lines.extend([
            f"### {finding['id']} - {finding['category']}",
            "",
            f"- **Page/file**: {finding['page_file']}",
            f"- **Problem**: {finding['problem']}",
            f"- **Evidence**: {finding['evidence']}",
            f"- **Consequence**: {finding['consequence']}",
            f"- **Priority**: {finding['priority']}",
            f"- **Impact**: {finding['impact']}",
            f"- **Effort**: {finding['effort']}",
            f"- **Recommended fix**: {finding['recommended_fix']}",
            f"- **Validation**: {finding['validation']}",
            "",
        ])
    lines.extend(["## Actions", ""])
    actions = report.get("actions", {})
    for label in ("now", "next", "later"):
        lines.append(f"### {label.title()}")
        items = actions.get(label, [])
        if items:
            lines.extend(f"- {item}" for item in items)
        else:
            lines.append("- None.")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def print_report(data: dict[str, Any], fmt: str) -> None:
    if fmt == "json":
        print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))
    elif fmt == "markdown":
        print(render_markdown(data))
    else:
        raise ValueError(f"Unsupported format: {fmt}")


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("source", help="URL or local HTML file path to inspect.")
    parser.add_argument("--format", choices=("json", "markdown"), default="json", help="Output format.")


def run_cli(callback: Any) -> int:
    try:
        callback()
        return 0
    except (FileNotFoundError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        print(f"error: unexpected failure: {exc}", file=sys.stderr)
        return 1
