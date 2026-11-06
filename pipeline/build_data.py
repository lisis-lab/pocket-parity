"""Builds site/data/price-levels.json from official sources.

Skeleton only: the fetch functions are placeholders to be implemented
following docs/methodology.md.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site" / "data" / "price-levels.json"

# COICOP-based categories used by the site.
CATEGORIES = ["all", "rest", "food", "trans", "rec", "cloth"]


def fetch_eurostat_pli() -> dict:
    """TODO: Eurostat prc_ppp_ind, price level indices by category (EU27 -> rebase US=100)."""
    raise NotImplementedError


def fetch_icp_pli() -> dict:
    """TODO: World Bank ICP price level indices by category for non-EU countries."""
    raise NotImplementedError


def fetch_fx_rates() -> dict:
    """TODO: ECB/Fed reference rates, units per 1 USD."""
    raise NotImplementedError


def main() -> None:
    data = {
        "generated": date.today().isoformat(),
        "base": "US=100",
        "categories": CATEGORIES,
        "countries": {},  # filled by the fetchers above
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
