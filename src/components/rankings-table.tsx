"use client";

import { useMemo, useState } from "react";

import {
  priceTiers,
  restaurantCategories,
} from "@/data/restaurants";
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
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
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
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const totalPages = Math.max(1, Math.ceil(visibleRankings.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRankings = useMemo(
    () => visibleRankings.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, visibleRankings],
  );

  function updateFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function toggleCategory(category: Filters["categories"][number]) {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((value) => value !== category)
      : [...filters.categories, category];

    updateFilters({ ...filters, categories: nextCategories });
  }

  const visibleCategories = categoriesExpanded
    ? restaurantCategories
    : Array.from(new Set([...restaurantCategories.slice(0, 6), ...filters.categories]));

  return (
    <div className="stack-lg">
      <section className="hero-panel compact rankings-hero">
        <div>
          <span className="eyebrow">Live leaderboard</span>
          <h1 className="rankings-hero-title">San Francisco Restaurant Rankings</h1>
        </div>
      </section>

      <section className="filter-shell">
        <div className="filter-strip">
          <div className="filter-strip-head">
            <div>
              <span className="eyebrow">Categories</span>
              <p className="filter-note">
                {filters.categories.length === 0
                  ? "Default view: sit-down restaurants only"
                  : `${filters.categories.length} categories selected`}
              </p>
            </div>
            <div className="filter-strip-actions">
              <button
                className="filter-subtle"
                onClick={() => updateFilters({ ...filters, categories: [] })}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="chip-row">
            {visibleCategories.map((category) => (
              <button
                key={category}
                className={filters.categories.includes(category) ? "filter-chip active" : "filter-chip"}
                onClick={() => toggleCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <button
            className="filter-toggle"
            onClick={() => setCategoriesExpanded((value) => !value)}
            type="button"
          >
            {categoriesExpanded ? "Show fewer categories" : "Show more categories"}
          </button>
        </div>

        <section className="filter-bar filter-bar-compact">
        <label>
          Price
          <select
            value={filters.priceTier}
            onChange={(event) =>
              updateFilters({
                ...filters,
                priceTier: event.target.value as Filters["priceTier"],
              })
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
              updateFilters({
                ...filters,
                radiusMiles: Number(event.target.value),
              })
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
              updateFilters({ ...filters, locationQuery: event.target.value })
            }
          />
        </label>
        </section>
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

          {pagedRankings.map((restaurant) => (
            <article className="rankings-row" key={restaurant.id}>
              <span className="rank-pill">#{restaurant.rank}</span>
              <div>
                <h3>{restaurant.name}</h3>
                <p>
                  {restaurant.category} · {restaurant.type} · {restaurant.neighborhood} · {restaurant.zipCode}
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
              <p>Try a wider radius, different categories, or another location.</p>
            </div>
          ) : (
            <div className="pagination-bar">
              <p>
                Showing {Math.min((currentPage - 1) * pageSize + 1, visibleRankings.length)}-
                {Math.min(currentPage * pageSize, visibleRankings.length)} of {visibleRankings.length}
              </p>
              <div className="pagination-actions">
                <button
                  className="skip-button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className="skip-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
