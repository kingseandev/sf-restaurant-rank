from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import pyarrow.parquet as pq


ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATH = ROOT / "data" / "sf-places.parquet"
OUTPUT_PATH = ROOT / "src" / "data" / "restaurants.generated.json"

SF_LOCALITIES = {
    "san francisco",
    "san-francisco",
    "sf",
    "san francisco, ca, us",
    "san francisco, ca",
    "san francisco ca",
    "san fransico",
    "san fransisco",
}

ZIP_TO_AREA = {
    "94102": "Hayes Valley",
    "94103": "SoMa",
    "94104": "Downtown",
    "94105": "Rincon Hill",
    "94107": "Mission Bay",
    "94108": "Chinatown",
    "94109": "Nob Hill",
    "94110": "Mission",
    "94111": "Embarcadero",
    "94112": "Ingleside",
    "94114": "Castro",
    "94115": "Fillmore",
    "94116": "Outer Sunset",
    "94117": "NOPA",
    "94118": "Inner Richmond",
    "94121": "Outer Richmond",
    "94122": "Sunset",
    "94123": "Marina",
    "94124": "Bayview",
    "94127": "St. Francis Wood",
    "94129": "Presidio",
    "94130": "Treasure Island",
    "94131": "Noe Valley",
    "94132": "Lake Merced",
    "94133": "North Beach",
    "94134": "Visitacion Valley",
    "94158": "Mission Bay",
}

ALLOWED_NON_RESTAURANT_FOOD = {
    "bar",
    "bakery",
    "cafe",
    "coffee_shop",
    "sandwich_shop",
    "juice_bar",
    "pub",
    "deli",
    "bar_and_grill",
    "food_court",
    "food_truck",
    "ice_cream_shop",
    "cocktail_bar",
    "wine_bar",
    "tea_house",
    "bubble_tea_shop",
    "dessert_shop",
    "breakfast_restaurant",
    "breakfast_and_brunch_restaurant",
    "fast_food_restaurant",
    "casual_eatery",
}

UPSCALE_CATEGORIES = {
    "french_restaurant",
    "steakhouse",
    "seafood_restaurant",
    "fine_dining_restaurant",
    "tasting_menu_restaurant",
}

BAR_CATEGORIES = {
    "bar",
    "cocktail_bar",
    "wine_bar",
    "pub",
    "bar_and_grill",
}

QUICK_CATEGORIES = {
    "fast_food_restaurant",
    "food_truck",
    "burger_restaurant",
    "sandwich_shop",
    "pizza_restaurant",
    "taqueria",
    "taco_restaurant",
    "hot_dog_restaurant",
    "burrito_restaurant",
}

CAFE_CATEGORIES = {
    "coffee_shop",
    "cafe",
    "bakery",
    "dessert_shop",
    "ice_cream_shop",
    "tea_house",
    "bubble_tea_shop",
    "juice_bar",
}

FAST_CASUAL_CATEGORIES = {
    "casual_eatery",
    "deli",
    "sandwich_shop",
    "salad_restaurant",
    "ramen_restaurant",
    "noodle_restaurant",
    "poke_restaurant",
    "pizza_restaurant",
    "mexican_restaurant",
    "mediterranean_restaurant",
    "middle_eastern_restaurant",
    "burrito_restaurant",
}


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalize_text(value).lower()).strip("-")


def prettify_category(category: str) -> str:
    return category.replace("_", " ").replace("bbq", "BBQ").title()


def inferred_type(category: str, basic_category: str) -> str:
    token = category or basic_category

    if token in QUICK_CATEGORIES:
        return "Quick Service"
    if token in CAFE_CATEGORIES:
        return "Cafe & Bakery"
    if token in BAR_CATEGORIES:
        return "Bar & Small Plates"
    if token in UPSCALE_CATEGORIES:
        return "Fine Dining"
    if token in FAST_CASUAL_CATEGORIES:
        return "Fast Casual"
    if token.endswith("_restaurant"):
        return "Sit-Down"
    if token == "restaurant":
        return "Sit-Down"

    return "Fast Casual"


def inferred_price_tier(category: str, restaurant_type: str) -> str:
    if category in UPSCALE_CATEGORIES or restaurant_type == "Fine Dining":
        return "$$$$"
    if restaurant_type == "Quick Service":
        return "$"
    if restaurant_type in {"Fast Casual", "Cafe & Bakery"}:
        return "$$"
    return "$$$"


def is_restaurant_like(category: str, basic_category: str, hierarchy: list[str]) -> bool:
    tokens = {token for token in [category, basic_category, *hierarchy] if token}
    if "restaurant" in tokens or any(token.endswith("_restaurant") for token in tokens):
        return True
    return any(token in ALLOWED_NON_RESTAURANT_FOOD for token in tokens)


@dataclass
class Candidate:
    id: str
    name: str
    type: str
    neighborhood: str
    zip_code: str
    price_tier: str
    tagline: str
    lat: float
    lng: float
    confidence: float


def main() -> None:
    table = pq.read_table(
        SOURCE_PATH,
        columns=[
            "id",
            "bbox",
            "names",
            "categories",
            "basic_category",
            "taxonomy",
            "addresses",
            "confidence",
        ],
    )

    deduped: dict[str, Candidate] = {}

    for row in table.to_pylist():
        name = ((row.get("names") or {}).get("primary") or "").strip()
        if not name:
            continue

        addresses = row.get("addresses") or []
        address = addresses[0] if addresses else {}
        locality = normalize_text((address.get("locality") or "").strip().lower())
        if locality not in SF_LOCALITIES:
            continue

        postcode = (address.get("postcode") or "").strip()[:5]
        if not postcode.startswith("941"):
            continue

        taxonomy = row.get("taxonomy") or {}
        category = ((row.get("categories") or {}).get("primary") or "").strip()
        basic_category = (row.get("basic_category") or "").strip()
        hierarchy = [token for token in (taxonomy.get("hierarchy") or []) if token]

        if not is_restaurant_like(category, basic_category, hierarchy):
            continue

        bbox = row.get("bbox") or {}
        xmin = bbox.get("xmin")
        xmax = bbox.get("xmax")
        ymin = bbox.get("ymin")
        ymax = bbox.get("ymax")
        if None in {xmin, xmax, ymin, ymax}:
            continue

        restaurant_type = inferred_type(category, basic_category)
        price_tier = inferred_price_tier(category or basic_category, restaurant_type)
        neighborhood = ZIP_TO_AREA.get(postcode, "San Francisco")
        category_label = prettify_category(category or basic_category or "restaurant")
        tagline = f"{category_label} in {neighborhood}."
        confidence = float(row.get("confidence") or 0)

        candidate = Candidate(
            id=str(row["id"]),
            name=name,
            type=restaurant_type,
            neighborhood=neighborhood,
            zip_code=postcode,
            price_tier=price_tier,
            tagline=tagline,
            lat=round((float(ymin) + float(ymax)) / 2, 6),
            lng=round((float(xmin) + float(xmax)) / 2, 6),
            confidence=confidence,
        )

        dedupe_key = f"{slugify(name)}::{postcode}::{restaurant_type}"
        existing = deduped.get(dedupe_key)
        if existing is None or candidate.confidence > existing.confidence:
            deduped[dedupe_key] = candidate

    restaurants = [
        {
            "id": candidate.id,
            "name": candidate.name,
            "type": candidate.type,
            "neighborhood": candidate.neighborhood,
            "zipCode": candidate.zip_code,
            "priceTier": candidate.price_tier,
            "tagline": candidate.tagline,
            "coordinates": {"lat": candidate.lat, "lng": candidate.lng},
        }
        for candidate in sorted(
            deduped.values(),
            key=lambda item: (-item.confidence, item.name.lower(), item.zip_code),
        )
    ]

    OUTPUT_PATH.write_text(json.dumps(restaurants, indent=2) + "\n")
    print(f"Wrote {len(restaurants)} restaurants to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
