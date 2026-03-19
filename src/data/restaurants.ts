import rawRestaurants from "@/data/restaurants.generated.json";

export type RestaurantCategory =
  | "Coffee & Tea"
  | "Bakery & Desserts"
  | "Bars & Drinks"
  | "Breakfast & Brunch"
  | "Fast Food"
  | "Pizza"
  | "Mexican & Latin"
  | "Asian"
  | "Mediterranean"
  | "Seafood"
  | "Fine Dining"
  | "American"
  | "Italian"
  | "Other Eats";

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
  category: RestaurantCategory;
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
export const restaurantCategories: RestaurantCategory[] = [
  "Coffee & Tea",
  "Bakery & Desserts",
  "Bars & Drinks",
  "Breakfast & Brunch",
  "Fast Food",
  "Pizza",
  "Mexican & Latin",
  "Asian",
  "Mediterranean",
  "Seafood",
  "Fine Dining",
  "American",
  "Italian",
  "Other Eats",
];

export const defaultSelectedCategories: RestaurantCategory[] = [
  "Asian",
  "American",
  "Mexican & Latin",
  "Mediterranean",
  "Seafood",
  "Fine Dining",
  "Italian",
  "Other Eats",
  "Breakfast & Brunch",
  "Pizza",
];

export const defaultRestaurantTypes: RestaurantType[] = [
  "Sit-Down",
  "Fine Dining",
  "Bar & Small Plates",
];

export const restaurants = rawRestaurants as Restaurant[];
