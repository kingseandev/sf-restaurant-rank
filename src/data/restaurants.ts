import rawRestaurants from "@/data/restaurants.generated.json";

export type RestaurantType =
  | "Quick Service"
  | "Fast Casual"
  | "Cafe & Bakery"
  | "Sit-Down"
  | "Fine Dining"
  | "Bar & Small Plates";

export type PriceTier = "$" | "$$" | "$$$" | "$$$$";

export type Restaurant = {
  id: string;
  name: string;
  type: RestaurantType;
  neighborhood: string;
  zipCode: string;
  priceTier: PriceTier;
  tagline: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export const restaurantTypes: RestaurantType[] = [
  "Quick Service",
  "Fast Casual",
  "Cafe & Bakery",
  "Sit-Down",
  "Fine Dining",
  "Bar & Small Plates",
];

export const priceTiers: PriceTier[] = ["$", "$$", "$$$", "$$$$"];

export const restaurants = rawRestaurants as Restaurant[];
