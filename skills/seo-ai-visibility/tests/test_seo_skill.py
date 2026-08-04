from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
FIXTURES = ROOT / "tests" / "fixtures"

sys.path.insert(0, str(SCRIPTS))

from seo_audit_lib import audit_page, page_to_structured_data, parse_page  # noqa: E402
from validate_seo_output import validate_report  # noqa: E402


class SeoSkillTests(unittest.TestCase):
    def finding_problems(self, fixture: str) -> list[str]:
        report = audit_page(parse_page(str(FIXTURES / fixture)))
        return [finding["problem"] for finding in report["findings"]]

    def test_valid_page(self) -> None:
        report = audit_page(parse_page(str(FIXTURES / "valid.html")))
        self.assertEqual(report["summary"]["title"], "Helena Joias Artesanais em Prata")
        self.assertEqual(report["summary"]["h1_count"], 1)
        self.assertEqual(report["summary"]["broken_internal_links"], 0)

    def test_missing_title(self) -> None:
        self.assertIn("Missing title element", self.finding_problems("problem.html"))

    def test_multiple_h1(self) -> None:
        self.assertIn("Multiple H1 headings", self.finding_problems("problem.html"))

    def test_canonical_conflict_for_url_source(self) -> None:
        html_path = FIXTURES / "canonical_conflict.html"
        html = html_path.read_text(encoding="utf-8")
        with tempfile.NamedTemporaryFile("w", suffix=".html", encoding="utf-8", delete=False) as handle:
            handle.write(html.replace("https://other.example/page", "https://other.example/page"))
            temp_path = Path(handle.name)
        try:
            page = parse_page(str(temp_path))
            page.source = "https://example.com/page"
            problems = [finding["problem"] for finding in audit_page(page)["findings"]]
            self.assertIn("Canonical points to another host", problems)
        finally:
            temp_path.unlink(missing_ok=True)

    def test_noindex(self) -> None:
        self.assertIn("Page is marked noindex", self.finding_problems("problem.html"))

    def test_image_without_alt(self) -> None:
        self.assertIn("Images without alt attribute", self.finding_problems("problem.html"))

    def test_invalid_json_ld(self) -> None:
        self.assertIn("Invalid JSON-LD", self.finding_problems("problem.html"))

    def test_schema_incompatible_with_content(self) -> None:
        self.assertIn("Product schema may be unsupported by visible content", self.finding_problems("schema_mismatch.html"))

    def test_broken_internal_links(self) -> None:
        self.assertIn("Broken local internal links", self.finding_problems("problem.html"))

    def test_main_content_absent_from_html(self) -> None:
        self.assertIn("No content inside main element", self.finding_problems("problem.html"))

    def test_markdown_output(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "audit_page.py"), str(FIXTURES / "problem.html"), "--format", "markdown"],
            text=True,
            capture_output=True,
            check=True,
        )
        self.assertIn("# SEO Audit Report", result.stdout)
        self.assertIn("## Findings", result.stdout)

    def test_json_output(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "inspect_structured_data.py"), str(FIXTURES / "valid.html"), "--format", "json"],
            text=True,
            capture_output=True,
            check=True,
        )
        data = json.loads(result.stdout)
        self.assertEqual(data["structured_data"]["schema_types"], ["Organization"])

    def test_invalid_arguments(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "audit_page.py"), str(FIXTURES / "valid.html"), "--format", "xml"],
            text=True,
            capture_output=True,
        )
        self.assertNotEqual(result.returncode, 0)

    def test_nonexistent_file(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "audit_page.py"), str(FIXTURES / "does-not-exist.html")],
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("does not exist", result.stderr)

    def test_validate_report_requires_actionable_fields(self) -> None:
        page = parse_page(str(FIXTURES / "problem.html"))
        errors = validate_report(audit_page(page))
        self.assertEqual(errors, [])
        errors = validate_report({"findings": [{"id": "SEO-001"}]})
        self.assertTrue(any("missing keys" in error for error in errors))

    def test_structured_data_warning_is_deterministic(self) -> None:
        data = page_to_structured_data(parse_page(str(FIXTURES / "schema_mismatch.html")))
        self.assertEqual(data["warnings"], ["Product schema appears without visible price, offer, or availability terms."])


if __name__ == "__main__":
    unittest.main()
