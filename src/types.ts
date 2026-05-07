export type Category = '전체' | '로컬맛집' | '관광맛집' | '마사지' | '마트·시장' | '카페';

export interface Location {
  lat: number;
  lng: number;
}

export interface Admission {
  adult: number;
  child: number;
  unit: string;
  note: string;
}

export interface Attraction {
  id: string;
  name: string;
  name_local: string;
  category: string;
  description: string;
  admission: Admission;
  hours: string;
  duration_hours: number;
  location: Location;
  distance_from_center_km: number;
  transport: string;
  grab_cost_approx: number;
  kids_tip: string;
  photo_spots: string[];
  highlights: string[];
  tips: string;
  local_rating: number;
  type: string;
}

export interface MenuItem {
  name: string;
  price: number;
  desc: string;
}

export interface Restaurant {
  id: string;
  name: string;
  name_kr: string;
  city: string;
  address: string;
  category: string;
  signature_menu: MenuItem[];
  avg_cost_per_person: number;
  hours: string;
  local_badge: boolean;
  local_review_ratio: number;
  rating: number;
  good_review: string;
  bad_review: string;
  tips: string;
  type: string;
  location?: Location;
}

export interface MassageService {
  name: string;
  price: number;
}

export interface MassageShop {
  id: string;
  name: string;
  name_kr: string;
  city: string;
  address: string;
  type: string;
  services: MassageService[];
  hours: string;
  rating: number;
  local_review_ratio: number;
  good_review: string;
  bad_review: string;
  tips: string;
  reservation: string;
  location?: Location;
}

export interface Cafe {
  id: string;
  name: string;
  name_kr: string;
  city: string;
  address: string;
  type: string;
  local_review_ratio: number;
  ambiance: string;
  signature_menu: { name: string; price: number; desc: string }[];
  avg_cost: number;
  hours: string;
  wifi: boolean;
  ac: boolean;
  rating: number;
  kids_tip: string;
  good_review: string;
  bad_review: string;
  tips: string;
  photo_spots: string[];
}

export interface Market {
  id: string;
  name: string;
  name_local: string;
  city: string;
  address: string;
  type: string;
  hours: string;
  location: { lat: number; lng: number };
  rating: number;
  description: string;
  best_for: string[];
  price_level: string;
  kids_tip: string;
  good_review: string;
  bad_review: string;
  tips: string;
  photo_spots: string[];
}

export interface DBContent {
  attractions: {
    danang: Attraction[];
    hoian: Attraction[];
  };
  restaurants: {
    local: Restaurant[];
    tourist: Restaurant[];
  };
  massage_shops: MassageShop[];
  seasonal_fruits: any;
  shopping: any;
  cafes: {
    danang: Cafe[];
    hoian: Cafe[];
  };
  markets_marts: {
    danang: Market[];
    hoian: Market[];
  };
}

export interface UserPlace {
  id?: string;
  created_at?: string;
  name: string;
  name_kr?: string;
  category: Category;
  rating: number;
  location: Location;
  address: string;
  good_review: string;
  bad_review: string;
  tips?: string;
  avg_cost?: string;
  google_place_id?: string;
  user_id?: string;
}

export interface PlaceData {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  distanceVal?: number;
  time: string;
  cost: string;
  isLocal: boolean;
  isUserPlace?: boolean;
  isGooglePlace?: boolean;
  location?: Location;
  summary: {
    pros: string;
    cons: string;
  };
}
