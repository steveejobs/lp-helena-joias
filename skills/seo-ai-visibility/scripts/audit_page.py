from __future__ import annotations

import argparse

from seo_audit_lib import add_common_args, audit_page, parse_page, print_report, run_cli


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit a URL or local HTML file for SEO, structured data, links, and crawler-visible content.")
    add_common_args(parser)
    args = parser.parse_args()
    page = parse_page(args.source)
    print_report(audit_page(page), args.format)


if __name__ == "__main__":
    raise SystemExit(run_cli(main))
