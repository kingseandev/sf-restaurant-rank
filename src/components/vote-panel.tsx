"use client";

import { useState } from "react";

import {
  defaultSelectedCategories,
  priceTiers,
  restaurantCategories,
  type Restaurant,
} from "@/data/restaurants";
import { chooseVotePair, type RankedRestaurant } from "@/lib/elo";
import { filterRestaurants, loadRankings, saveVote, type Filters } from "@/lib/storage";

function VoteCard({
  restaurant,
  onSelect,
}: {
  restaurant: Restaurant;
  onSelect: (restaurantId: string) => void;
}) {
  return (
    <button className="vote-card" onClick={() => onSelect(restaurant.id)} type="button">
      <span className="eyebrow">{restaurant.category}</span>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.tagline}</p>
      <div className="vote-meta">
        <span>{restaurant.type}</span>
        <span>{restaurant.neighborhood}</span>
        <span>{restaurant.zipCode}</span>
        <span>{restaurant.priceTier}</span>
      </div>
    </button>
  );
}

export function VotePanel() {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceTier: "All",
    locationQuery: "",
    radiusMiles: 3,
  });
  const [rankings, setRankings] = useState<RankedRestaurant[]>(() => loadRankings());
  const [pair, setPair] = useState<[Restaurant, Restaurant] | null>(() =>
    chooseVotePair(
      filterRestaurants({
        categories: [],
        priceTier: "All",
        locationQuery: "",
        radiusMiles: 3,
      }),
      loadRankings(),
    ),
  );

  function refreshPair(nextRankings: RankedRestaurant[]) {
    const options = filterRestaurants(filters);
    setPair(chooseVotePair(options, nextRankings));
  }

  function updateFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    setPair(chooseVotePair(filterRestaurants(nextFilters), rankings));
  }

  function handleVote(winnerId: string) {
    if (!pair) {
      return;
    }

    const loserId = pair[0].id === winnerId ? pair[1].id : pair[0].id;
    saveVote(winnerId, loserId);
    const nextRankings = loadRankings();
    setRankings(nextRankings);
    refreshPair(nextRankings);
  }

  function handleSkip() {
    refreshPair(rankings);
  }

  function toggleCategory(category: Filters["categories"][number]) {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((value) => value !== category)
      : [...filters.categories, category];

    updateFilters({ ...filters, categories: nextCategories });
  }

  return (
    <div className="stack-lg">
      <section className="filter-shell">
        <div className="filter-strip">
          <div className="filter-strip-head">
            <div>
              <span className="eyebrow">Categories</span>
              <p className="filter-note">
                {filters.categories.length === 0
                  ? "Default view: restaurant categories only"
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
            {restaurantCategories.map((category) => (
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
            placeholder="Try 94110, Hayes Valley, or Mission"
            value={filters.locationQuery}
            onChange={(event) =>
              updateFilters({ ...filters, locationQuery: event.target.value })
            }
          />
        </label>
        </section>
      </section>

      {pair ? (
        <section className="vote-grid">
          <VoteCard restaurant={pair[0]} onSelect={handleVote} />
          <div className="vote-middle">
            <div className="vote-divider">OR</div>
            <button className="skip-button" onClick={handleSkip} type="button">
              Skip matchup
            </button>
          </div>
          <VoteCard restaurant={pair[1]} onSelect={handleVote} />
        </section>
      ) : (
        <section className="empty-state">
          <h2>Not enough restaurants match those filters.</h2>
          <p>Try a wider radius, different categories, or another location.</p>
        </section>
      )}
    </div>
  );
}
