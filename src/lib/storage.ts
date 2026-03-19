"use client";

import {
  defaultRestaurantTypes,
  restaurants,
  type PriceTier,
  type RestaurantCategory,
  type Restaurant,
  type RestaurantType,
} from "@/data/restaurants";
import { computeRankings, type VoteRecord } from "@/lib/elo";

const STORAGE_KEY = "sf-restaurant-rank-v2";

export type Filters = {
  categories: RestaurantCategory[];
  priceTier: PriceTier | "All";
  locationQuery: string;
  radiusMiles: number;
};

function effectiveTypes(filters: Filters): RestaurantType[] | null {
  if (filters.categories.length === 0) {
    return defaultRestaurantTypes;
  }

  return null;
}

type StoredState = {
  votes: VoteRecord[];
};

const seededNameVotes = [
  ["Zuni Cafe", "Tartine Manufactory"],
  ["House of Prime Rib", "Liholiho Yacht Club"],
  ["La Taqueria", "Senor Sisig"],
  ["Nopa", "Souvla"],
  ["The Progress", "Foreign Cinema"],
  ["Rintaro", "Swan Oyster Depot"],
  ["La Taqueria", "Souvla"],
  ["Foreign Cinema", "Tartine Manufactory"],
  ["Liholiho Yacht Club", "The Progress"],
  ["Senor Sisig", "Swan Oyster Depot"],
  ["Nopa", "House of Prime Rib"],
  ["Zuni Cafe", "Foreign Cinema"],
  ["Rintaro", "Liholiho Yacht Club"],
  ["The Progress", "House of Prime Rib"],
  ["Souvla", "Tartine Manufactory"],
  ["La Taqueria", "Senor Sisig"],
  ["Nopa", "Zuni Cafe"],
] as const;

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function createSeedVotes(): VoteRecord[] {
  const byName = new Map(
    restaurants.map((restaurant) => [normalizeName(restaurant.name), restaurant.id]),
  );

  return seededNameVotes.flatMap(([winnerName, loserName], index) => {
    const winnerId = byName.get(normalizeName(winnerName));
    const loserId = byName.get(normalizeName(loserName));

    if (!winnerId || !loserId) {
      return [];
    }

    return [
      {
        winnerId,
        loserId,
        createdAt: daysAgo(12 - Math.min(index, 11)),
      },
    ];
  });
}

function getSeedState(): StoredState {
  return { votes: createSeedVotes() };
}

export function loadState(): StoredState {
  if (typeof window === "undefined") {
    return getSeedState();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = getSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(stored) as StoredState;
  } catch {
    const seed = getSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveVote(winnerId: string, loserId: string) {
  const current = loadState();
  const nextState: StoredState = {
    votes: [
      ...current.votes,
      { winnerId, loserId, createdAt: new Date().toISOString() },
    ],
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

  return nextState;
}

function extractZip(query: string) {
  const match = query.match(/\b94\d{3}\b/);
  return match?.[0] ?? null;
}

const locationCenters: Record<string, { lat: number; lng: number }> = {
  "94102": { lat: 37.7799, lng: -122.4194 },
  "94103": { lat: 37.7725, lng: -122.4091 },
  "94104": { lat: 37.7915, lng: -122.4021 },
  "94105": { lat: 37.7898, lng: -122.3942 },
  "94107": { lat: 37.7669, lng: -122.3959 },
  "94108": { lat: 37.7925, lng: -122.4083 },
  "94109": { lat: 37.7927, lng: -122.4212 },
  "94110": { lat: 37.7487, lng: -122.4158 },
  "94111": { lat: 37.7993, lng: -122.3981 },
  "94115": { lat: 37.7851, lng: -122.4374 },
  "94114": { lat: 37.7594, lng: -122.4349 },
  "94117": { lat: 37.7709, lng: -122.4440 },
  "94118": { lat: 37.7817, lng: -122.4618 },
  "94121": { lat: 37.7794, lng: -122.4949 },
  "94122": { lat: 37.7596, lng: -122.4866 },
  "94123": { lat: 37.8009, lng: -122.4382 },
  "94124": { lat: 37.7316, lng: -122.3825 },
  "94127": { lat: 37.7352, lng: -122.4586 },
  "94129": { lat: 37.7999, lng: -122.4645 },
  "94130": { lat: 37.8210, lng: -122.3712 },
  "94131": { lat: 37.7459, lng: -122.4408 },
  "94132": { lat: 37.7216, lng: -122.4848 },
  "94133": { lat: 37.8032, lng: -122.4107 },
  "94134": { lat: 37.7198, lng: -122.4100 },
  "94137": { lat: 37.7715, lng: -122.3870 },
  "94143": { lat: 37.7631, lng: -122.4586 },
  "94158": { lat: 37.7707, lng: -122.3871 },
  "hayes valley": { lat: 37.7764, lng: -122.4241 },
  "mission": { lat: 37.7599, lng: -122.4148 },
  "nopa": { lat: 37.7749, lng: -122.4375 },
  "nob hill": { lat: 37.7930, lng: -122.4161 },
  "fillmore": { lat: 37.7837, lng: -122.4328 },
  "polk gulch": { lat: 37.7908, lng: -122.4209 },
  "russian hill": { lat: 37.8004, lng: -122.4192 },
  "soma": { lat: 37.7786, lng: -122.4057 },
  "downtown": { lat: 37.7898, lng: -122.4008 },
  "rincon hill": { lat: 37.7860, lng: -122.3927 },
  "mission bay": { lat: 37.7706, lng: -122.3910 },
  "chinatown": { lat: 37.7941, lng: -122.4078 },
  "embarcadero": { lat: 37.7955, lng: -122.3937 },
  "castro": { lat: 37.7609, lng: -122.4350 },
  "inner richmond": { lat: 37.7809, lng: -122.4784 },
  "outer richmond": { lat: 37.7799, lng: -122.4892 },
  "sunset": { lat: 37.7544, lng: -122.4901 },
  "outer sunset": { lat: 37.7534, lng: -122.4942 },
  "marina": { lat: 37.8037, lng: -122.4368 },
  "bayview": { lat: 37.7295, lng: -122.3929 },
  "presidio": { lat: 37.7989, lng: -122.4662 },
  "noe valley": { lat: 37.7502, lng: -122.4337 },
  "lake merced": { lat: 37.7282, lng: -122.4930 },
  "north beach": { lat: 37.8061, lng: -122.4103 },
  "visitacion valley": { lat: 37.7158, lng: -122.4051 },
};

function resolveLocationCenter(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const zip = extractZip(normalizedQuery);

  if (zip && locationCenters[zip]) {
    return locationCenters[zip];
  }

  return locationCenters[normalizedQuery] ?? null;
}

function milesBetween(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(second.lat - first.lat);
  const dLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

export function filterRestaurants(filters: Filters): Restaurant[] {
  const center = resolveLocationCenter(filters.locationQuery);
  const implicitTypes = effectiveTypes(filters);

  return restaurants.filter((restaurant) => {
    const categoryMatches =
      filters.categories.length === 0 || filters.categories.includes(restaurant.category);
    const typeMatches =
      implicitTypes === null || implicitTypes.includes(restaurant.type);
    const priceMatches =
      filters.priceTier === "All" || restaurant.priceTier === filters.priceTier;
    const locationMatches =
      filters.locationQuery.trim().length === 0 ||
      (center !== null &&
        milesBetween(center, restaurant.coordinates) <= filters.radiusMiles);

    return categoryMatches && typeMatches && priceMatches && locationMatches;
  });
}

export function loadRankings() {
  return computeRankings(loadState().votes);
}
