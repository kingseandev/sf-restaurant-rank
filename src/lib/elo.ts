import { restaurants, type Restaurant } from "@/data/restaurants";

export type VoteRecord = {
  winnerId: string;
  loserId: string;
  createdAt: string;
};

export type RankedRestaurant = Restaurant & {
  elo: number;
  wins: number;
  losses: number;
  votes: number;
  previousRank: number;
  rank: number;
  trend: number;
};

const BASE_ELO = 1500;
const K_FACTOR = 28;

function normalizeRestaurantName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function expectedScore(playerRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

function applyVote(
  ratings: Map<string, { elo: number; wins: number; losses: number }>,
  winnerId: string,
  loserId: string,
) {
  const winner = ratings.get(winnerId);
  const loser = ratings.get(loserId);

  if (!winner || !loser) {
    return;
  }

  const winnerExpected = expectedScore(winner.elo, loser.elo);
  const loserExpected = expectedScore(loser.elo, winner.elo);

  winner.elo += K_FACTOR * (1 - winnerExpected);
  loser.elo += K_FACTOR * (0 - loserExpected);
  winner.wins += 1;
  loser.losses += 1;
}

function buildBaseRatings() {
  return new Map(
    restaurants.map((restaurant) => [
      restaurant.id,
      { elo: BASE_ELO, wins: 0, losses: 0 },
    ]),
  );
}

function sortRankings(
  ratings: Map<string, { elo: number; wins: number; losses: number }>,
) {
  return restaurants
    .map((restaurant) => {
      const stats = ratings.get(restaurant.id);

      return {
        ...restaurant,
        elo: Math.round(stats?.elo ?? BASE_ELO),
        wins: stats?.wins ?? 0,
        losses: stats?.losses ?? 0,
        votes: (stats?.wins ?? 0) + (stats?.losses ?? 0),
      };
    })
    .sort((a, b) => {
      if (b.elo !== a.elo) {
        return b.elo - a.elo;
      }

      return b.votes - a.votes;
    });
}

export function computeRankings(votes: VoteRecord[]): RankedRestaurant[] {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const currentRatings = buildBaseRatings();
  const pastRatings = buildBaseRatings();

  const sortedVotes = [...votes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const vote of sortedVotes) {
    applyVote(currentRatings, vote.winnerId, vote.loserId);

    if (new Date(vote.createdAt).getTime() < oneWeekAgo) {
      applyVote(pastRatings, vote.winnerId, vote.loserId);
    }
  }

  const current = sortRankings(currentRatings);
  const previous = sortRankings(pastRatings);

  const previousRankMap = new Map(
    previous.map((restaurant, index) => [restaurant.id, index + 1]),
  );

  return current.map((restaurant, index) => {
    const rank = index + 1;
    const previousRank = previousRankMap.get(restaurant.id) ?? rank;

    return {
      ...restaurant,
      rank,
      previousRank,
      trend: previousRank - rank,
    };
  });
}

export function chooseVotePair(
  options: Restaurant[],
  ranked: RankedRestaurant[],
): [Restaurant, Restaurant] | null {
  if (options.length < 2) {
    return null;
  }

  const rankedMap = new Map(ranked.map((item) => [item.id, item]));
  const sorted = [...options].sort((a, b) => {
    const aRank = rankedMap.get(a.id)?.rank ?? Number.MAX_SAFE_INTEGER;
    const bRank = rankedMap.get(b.id)?.rank ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });

  const startIndex = Math.floor(Math.random() * (sorted.length - 1));
  const first = sorted[startIndex];
  const second = sorted
    .slice(startIndex + 1)
    .filter((candidate) => normalizeRestaurantName(candidate.name) !== normalizeRestaurantName(first.name))
    .sort((a, b) => {
      const aElo = rankedMap.get(a.id)?.elo ?? BASE_ELO;
      const bElo = rankedMap.get(b.id)?.elo ?? BASE_ELO;
      return Math.abs(aElo - (rankedMap.get(first.id)?.elo ?? BASE_ELO)) -
        Math.abs(bElo - (rankedMap.get(first.id)?.elo ?? BASE_ELO));
    })[0];
  return second ? [first, second] : null;
}
