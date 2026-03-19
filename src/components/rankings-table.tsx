"use client";

import { useMemo, useState } from "react";

import { priceTiers, restaurantTypes, type RestaurantType } from "@/data/restaurants";
import { filterRestaurants, loadRankings, type Filters } from "@/lib/storage";

function trendLabel(trend: number) {
  if (trend > 0) {
    return `↑ ${trend}`;
  }

  if (trend < 0) {
    return `↓ ${Math.abs(trend)}`;
  }

  return "• 0";
}

export function RankingsTable() {
  const [filters, setFilters] = useState<Filters>({
    type: "All",
    priceTier: "All",
    locationQuery: "",
    radiusMiles: 3,
  });
  const [rankings] = useState(loadRankings);

  const filteredIds = useMemo(
    () => new Set(filterRestaurants(filters).map((restaurant) => restaurant.id)),
    [filters],
  );

  const visibleRankings = useMemo(
    () => rankings.filter((restaurant) => filteredIds.has(restaurant.id)),
    [filteredIds, rankings],
  );

  return (
    <div className="stack-lg">
      <section className="hero-panel compact">
        <div>
          <span className="eyebrow">Live leaderboard</span>
          <h1>Current San Francisco restaurant rankings</h1>
          <p>
            Trend indicators compare each restaurant&apos;s position against where it stood
            seven days ago.
          </p>
        </div>
      </section>

      <section className="filter-bar">
        <label>
          Restaurant type
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                type: event.target.value as RestaurantType | "All",
              }))
            }
          >
            <option value="All">All</option>
            {restaurantTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price
          <select
            value={filters.priceTier}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priceTier: event.target.value as Filters["priceTier"],
              }))
            }
          >
            <option value="All">All</option>
            {priceTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </label>

        <label>
          Distance
          <select
            value={filters.radiusMiles}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                radiusMiles: Number(event.target.value),
              }))
            }
          >
            <option value={1}>1 mile</option>
            <option value={3}>3 miles</option>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
          </select>
        </label>

        <label>
          Location
          <input
            placeholder="Try 94109, Hayes Valley, or Mission"
            value={filters.locationQuery}
            onChange={(event) =>
              setFilters((current) => ({ ...current, locationQuery: event.target.value }))
            }
          />
        </label>
      </section>

      <section className="rankings-shell">
        <div className="rankings-table">
          <div className="rankings-head">
            <span>Rank</span>
            <span>Restaurant</span>
            <span>ELO</span>
            <span>7d Trend</span>
            <span>Votes</span>
          </div>

          {visibleRankings.map((restaurant) => (
            <article className="rankings-row" key={restaurant.id}>
              <span className="rank-pill">#{restaurant.rank}</span>
              <div>
                <h3>{restaurant.name}</h3>
                <p>
                  {restaurant.type} · {restaurant.neighborhood} · {restaurant.zipCode}
                </p>
              </div>
              <strong>{restaurant.elo}</strong>
              <span className={restaurant.trend === 0 ? "trend flat" : restaurant.trend > 0 ? "trend up" : "trend down"}>
                {trendLabel(restaurant.trend)}
              </span>
              <span>{restaurant.votes}</span>
            </article>
          ))}

          {visibleRankings.length === 0 ? (
            <div className="empty-state inline">
              <h2>No restaurants match that filter combination.</h2>
              <p>Try a wider radius, another price band, or a different ZIP code or neighborhood.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
