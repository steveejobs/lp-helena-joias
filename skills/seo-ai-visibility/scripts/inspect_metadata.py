from __future__ import annotations

import argparse

from seo_audit_lib import add_common_args, page_to_metadata, parse_page, print_report, run_cli


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract title, description, canonical, robots, headings, image alt, Open Graph, and Twitter metadata.")
    add_common_args(parser)
    args = parser.parse_args()
    print_report({"metadata": page_to_metadata(parse_page(args.source))}, args.format)


if __name__ == "__main__":
    raise SystemExit(run_cli(main))
