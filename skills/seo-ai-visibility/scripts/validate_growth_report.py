from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


VALID_VERDICTS = {
    "APPROVE_STRATEGIC_DISCOVERY", "APPROVE_STRATEGY_READY", "APPROVE_IMPLEMENTATION_LOCAL", "APPROVE_FULL_GROWTH_ENGINE",
    "BLOCK_PROJECT_NOT_IDENTIFIED", "BLOCK_BUSINESS_INFORMATION_MISSING", "BLOCK_AMBIGUOUS_NICHE", "BLOCK_UNSUPPORTED_ENVIRONMENT",
    "BLOCK_DIRTY_WORKTREE", "BLOCK_IMPLEMENTATION_FAILED", "BLOCK_VALIDATION_FAILED", "BLOCK_SECURITY_RISK",
    "BLOCK_CONTENT_EVIDENCE_MISSING", "BLOCK_DEPLOYMENT_REQUIRED", "BLOCK_OPERATOR_DECISION_REQUIRED",
}
REQUIRED_SECTIONS = {"business_identification", "diagnosis", "strategy", "architecture", "content", "implementation", "validation", "metrics", "pending_items", "verdict"}
REQUIRED_ACTION_KEYS = {"id", "priority", "category", "page_file", "problem", "evidence", "opportunity", "recommendation", "implementation", "impact", "effort", "risk", "dependency", "expected_result", "metric", "validation", "evidence_status"}


def validate_report(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    missing = sorted(REQUIRED_SECTIONS - set(report))
    if missing:
        errors.append(f"missing report sections: {', '.join(missing)}")
    verdict = report.get("verdict")
    if verdict not in VALID_VERDICTS:
        errors.append("verdict must contain exactly one supported verdict string")
    strategy = report.get("strategy")
    if not isinstance(strategy, dict):
        errors.append("strategy must be an object with P0, P1, P2, and P3 arrays")
        return errors
    for priority in ("P0", "P1", "P2", "P3"):
        actions = strategy.get(priority)
        if not isinstance(actions, list):
            errors.append(f"strategy.{priority} must be an array")
            continue
        for index, action in enumerate(actions):
            if not isinstance(action, dict):
                errors.append(f"strategy.{priority}[{index}] must be an object")
                continue
            missing_action = sorted(REQUIRED_ACTION_KEYS - set(action))
            if missing_action:
                errors.append(f"strategy.{priority}[{index}] missing keys: {', '.join(missing_action)}")
            elif action.get("priority") != priority:
                errors.append(f"strategy.{priority}[{index}].priority must be {priority}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a machine-readable Universal Strategic Growth Engine report.")
    parser.add_argument("report", help="Path to a JSON growth report.")
    args = parser.parse_args()
    path = Path(args.report)
    try:
        report = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"error: report does not exist: {args.report}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"error: report is not valid JSON: {exc.msg}", file=sys.stderr)
        return 2
    if not isinstance(report, dict):
        print("error: report root must be a JSON object", file=sys.stderr)
        return 2
    errors = validate_report(report)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1
    print("Growth report is valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
