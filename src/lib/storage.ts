"use client";

import {
  restaurants,
  type PriceTier,
  type Restaurant,
  type RestaurantType,
} from "@/data/restaurants";
import { computeRankings, type VoteRecord } from "@/lib/elo";

const STORAGE_KEY = "sf-restaurant-rank-v1";

export type Filters = {
  type: RestaurantType | "All";
  priceTier: PriceTier | "All";
  locationQuery: string;
  radiusMiles: number;
};

type StoredState = {
  votes: VoteRecord[];
};

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const seedVotes: VoteRecord[] = [
  { winnerId: "zuni-cafe", loserId: "tartine-manufactory", createdAt: daysAgo(12) },
  { winnerId: "house-of-prime-rib", loserId: "liholiho-yonkers", createdAt: daysAgo(11) },
  { winnerId: "la-taqueria", loserId: "senor-sisig-valencia", createdAt: daysAgo(10) },
  { winnerId: "nopa", loserId: "souvla-hayes", createdAt: daysAgo(9) },
  { winnerId: "the-progress", loserId: "foreign-cinema", createdAt: daysAgo(8) },
  { winnerId: "rintaro-mission", loserId: "swan-oyster-depot", createdAt: daysAgo(8) },
  { winnerId: "la-taqueria", loserId: "souvla-hayes", createdAt: daysAgo(7) },
  { winnerId: "foreign-cinema", loserId: "tartine-manufactory", createdAt: daysAgo(6) },
  { winnerId: "liholiho-yonkers", loserId: "the-progress", createdAt: daysAgo(6) },
  { winnerId: "senor-sisig-valencia", loserId: "swan-oyster-depot", createdAt: daysAgo(5) },
  { winnerId: "nopa", loserId: "house-of-prime-rib", createdAt: daysAgo(4) },
  { winnerId: "zuni-cafe", loserId: "foreign-cinema", createdAt: daysAgo(4) },
  { winnerId: "rintaro-mission", loserId: "liholiho-yonkers", createdAt: daysAgo(3) },
  { winnerId: "the-progress", loserId: "house-of-prime-rib", createdAt: daysAgo(2) },
  { winnerId: "souvla-hayes", loserId: "tartine-manufactory", createdAt: daysAgo(2) },
  { winnerId: "la-taqueria", loserId: "senor-sisig-valencia", createdAt: daysAgo(1) },
  { winnerId: "nopa", loserId: "zuni-cafe", createdAt: daysAgo(1) },
];

function getSeedState(): StoredState {
  return { votes: seedVotes };
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
  "94109": { lat: 37.7927, lng: -122.4212 },
  "94110": { lat: 37.7487, lng: -122.4158 },
  "94115": { lat: 37.7851, lng: -122.4374 },
  "94117": { lat: 37.7709, lng: -122.4440 },
  "hayes valley": { lat: 37.7764, lng: -122.4241 },
  "mission": { lat: 37.7599, lng: -122.4148 },
  "nopa": { lat: 37.7749, lng: -122.4375 },
  "nob hill": { lat: 37.7930, lng: -122.4161 },
  "fillmore": { lat: 37.7837, lng: -122.4328 },
  "polk gulch": { lat: 37.7908, lng: -122.4209 },
  "russian hill": { lat: 37.8004, lng: -122.4192 },
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

  return restaurants.filter((restaurant) => {
    const typeMatches = filters.type === "All" || restaurant.type === filters.type;
    const priceMatches =
      filters.priceTier === "All" || restaurant.priceTier === filters.priceTier;
    const locationMatches =
      filters.locationQuery.trim().length === 0 ||
      (center !== null &&
        milesBetween(center, restaurant.coordinates) <= filters.radiusMiles);

    return typeMatches && priceMatches && locationMatches;
  });
}

export function loadRankings() {
  return computeRankings(loadState().votes);
}
