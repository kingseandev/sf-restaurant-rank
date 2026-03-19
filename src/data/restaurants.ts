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

export const restaurants: Restaurant[] = [
  {
    id: "souvla-hayes",
    name: "Souvla",
    type: "Fast Casual",
    neighborhood: "Hayes Valley",
    zipCode: "94102",
    priceTier: "$$",
    tagline: "Rotisserie-driven Greek wraps and salads that move fast without feeling generic.",
    coordinates: { lat: 37.7764, lng: -122.4241 },
  },
  {
    id: "liholiho-yonkers",
    name: "Liholiho Yacht Club",
    type: "Sit-Down",
    neighborhood: "Nob Hill",
    zipCode: "94109",
    priceTier: "$$$",
    tagline: "Big-flavor Hawaiian-Californian plates that feel celebratory every night.",
    coordinates: { lat: 37.7914, lng: -122.4149 },
  },
  {
    id: "rintaro-mission",
    name: "Rintaro",
    type: "Sit-Down",
    neighborhood: "Mission",
    zipCode: "94110",
    priceTier: "$$$",
    tagline: "Warm izakaya energy with skewers, noodles, and a loyal local following.",
    coordinates: { lat: 37.7647, lng: -122.4214 },
  },
  {
    id: "tartine-manufactory",
    name: "Tartine Manufactory",
    type: "Cafe & Bakery",
    neighborhood: "Mission",
    zipCode: "94103",
    priceTier: "$$",
    tagline: "Pastries, coffee, and all-day plates from one of SF's most recognized bakery brands.",
    coordinates: { lat: 37.7614, lng: -122.4242 },
  },
  {
    id: "swan-oyster-depot",
    name: "Swan Oyster Depot",
    type: "Quick Service",
    neighborhood: "Polk Gulch",
    zipCode: "94109",
    priceTier: "$$$",
    tagline: "Iconic counter-service seafood with old-school San Francisco gravity.",
    coordinates: { lat: 37.7908, lng: -122.4209 },
  },
  {
    id: "nopa",
    name: "Nopa",
    type: "Sit-Down",
    neighborhood: "NOPA",
    zipCode: "94117",
    priceTier: "$$$",
    tagline: "Wood-fired California cooking that still anchors group dinners and date nights.",
    coordinates: { lat: 37.7749, lng: -122.4375 },
  },
  {
    id: "house-of-prime-rib",
    name: "House of Prime Rib",
    type: "Sit-Down",
    neighborhood: "Russian Hill",
    zipCode: "94109",
    priceTier: "$$$",
    tagline: "A classic destination experience built around one thing done very, very well.",
    coordinates: { lat: 37.7983, lng: -122.4228 },
  },
  {
    id: "the-progress",
    name: "The Progress",
    type: "Fine Dining",
    neighborhood: "Fillmore",
    zipCode: "94115",
    priceTier: "$$$$",
    tagline: "Modern format, polished hospitality, and menus that reward bigger groups.",
    coordinates: { lat: 37.7837, lng: -122.4328 },
  },
  {
    id: "senor-sisig-valencia",
    name: "Senor Sisig",
    type: "Quick Service",
    neighborhood: "Mission",
    zipCode: "94110",
    priceTier: "$",
    tagline: "Filipino-Mexican burritos and tacos that punch well above their price point.",
    coordinates: { lat: 37.7641, lng: -122.4212 },
  },
  {
    id: "la-taqueria",
    name: "La Taqueria",
    type: "Quick Service",
    neighborhood: "Mission",
    zipCode: "94110",
    priceTier: "$",
    tagline: "No-rice burrito legend with permanent line-out-the-door status.",
    coordinates: { lat: 37.7506, lng: -122.4182 },
  },
  {
    id: "zuni-cafe",
    name: "Zuni Cafe",
    type: "Fine Dining",
    neighborhood: "Hayes Valley",
    zipCode: "94102",
    priceTier: "$$$$",
    tagline: "The roast chicken standard-bearer, paired with one of the city's strongest dining rooms.",
    coordinates: { lat: 37.7735, lng: -122.4216 },
  },
  {
    id: "foreign-cinema",
    name: "Foreign Cinema",
    type: "Bar & Small Plates",
    neighborhood: "Mission",
    zipCode: "94103",
    priceTier: "$$$",
    tagline: "Movie-lit courtyard energy with cocktails, oysters, and a built-in special-occasion vibe.",
    coordinates: { lat: 37.7603, lng: -122.4213 },
  },
];
