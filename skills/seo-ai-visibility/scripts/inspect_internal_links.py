from __future__ import annotations

import argparse

from seo_audit_lib import add_common_args, page_to_links, parse_page, print_report, run_cli


def main() -> None:
    parser = argparse.ArgumentParser(description="List internal, external, special, and broken local links from a URL or local HTML file.")
    add_common_args(parser)
    args = parser.parse_args()
    print_report({"links": page_to_links(parse_page(args.source))}, args.format)


if __name__ == "__main__":
    raise SystemExit(run_cli(main))
