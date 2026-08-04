from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from discover_project import discover  # noqa: E402
from validate_growth_report import validate_report  # noqa: E402


def action(priority: str) -> dict[str, str]:
    return {
        "id": "GROW-001", "priority": priority, "category": "technical", "page_file": "/",
        "problem": "Example", "evidence": "Example", "opportunity": "Example", "recommendation": "Example",
        "implementation": "Example", "impact": "high", "effort": "small", "risk": "low", "dependency": "none",
        "expected_result": "Example", "metric": "Example", "validation": "Example", "evidence_status": "confirmed_by_project",
    }


class GrowthEngineTests(unittest.TestCase):
    def test_discovers_routes_metadata_and_schema(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "app").mkdir()
            (root / "app" / "page.tsx").write_text('export const metadata = { title: "Store" };', encoding="utf-8")
            (root / "app" / "sitemap.ts").write_text("export default function sitemap() {}", encoding="utf-8")
            (root / "package.json").write_text('{"name":"example","dependencies":{"next":"1.0.0"}}', encoding="utf-8")
            (root / "schema.ts").write_text('{"@type":"Organization"}', encoding="utf-8")
            report = discover(root)
        self.assertEqual(report["project_name"], "example")
        self.assertIn("next-app-router", report["framework_signals"])
        self.assertIn("app/page.tsx", report["route_files"])
        self.assertTrue(report["sitemap_present"])
        self.assertEqual(report["schema_types"], ["Organization"])

    def test_growth_report_contract(self) -> None:
        report = {
            "business_identification": {}, "diagnosis": {}, "architecture": {}, "content": {}, "implementation": {},
            "validation": {}, "metrics": {}, "pending_items": [], "verdict": "APPROVE_STRATEGY_READY",
            "strategy": {"P0": [], "P1": [action("P1")], "P2": [], "P3": []},
        }
        self.assertEqual(validate_report(report), [])
        report["strategy"]["P1"][0].pop("metric")
        self.assertTrue(validate_report(report))


if __name__ == "__main__":
    unittest.main()
