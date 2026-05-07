import { useState, useEffect } from 'react';
import { Star, Navigation, Clock, MessageCircle, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category } from '../types';
import DB from '../data/db.json';
import type { DBContent } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const db = DB as DBContent;

interface PlaceData {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  time: string;
  cost: string;
  isLocal: boolean;
  summary: {
    pros: string;
    cons: string;
  };
  isGooglePlace?: boolean;
}

const CategoryButton: React.FC<{ label: string, active?: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
      active ? "bg-teal text-white shadow-lg shadow-teal/20" : "bg-navy-card text-text-secondary border border-white/5"
    )}
  >
    {label}
  </button>
);

const MOCK_LOCATIONS = [
  { name: '📍 한시장', lat: 16.0683, lng: 108.2234 },
  { name: '🌊 미케비치', lat: 16.0471, lng: 108.2479 },
  { name: '🚠 바나힐', lat: 15.9973, lng: 107.9881 },
  { name: '🏮 올드타운', lat: 15.8801, lng: 108.3380 },
  { name: '🏖️ 안방비치', lat: 15.9060, lng: 108.3710 },
];

export const ExplorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [showMockButtons, setShowMockButtons] = useState(false);

  const fetchPlaces = (forcedCoords?: {lat: number, lng: number}) => {
    setLoading(true);
    setLocationError(false);
    
    if (forcedCoords) {
      setCurrentCoords(forcedCoords);
      fetchDataFromAPIAndDB(forcedCoords.lat, forcedCoords.lng);
      return;
    }

    // 1. Get real GPS location
    if (navigator.geolocation) {
      // Safety timeout: If GPS takes too long (> 10s), fallback to DB
      const safetyTimeout = setTimeout(() => {
        console.warn("GPS request timed out, using fallback.");
        setLocationError(true);
        setShowMockButtons(true);
        useOnlyDB();
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(safetyTimeout);
          const { latitude, longitude } = position.coords;
          
          const dist = Math.sqrt(Math.pow(latitude - 16.0544, 2) + Math.pow(longitude - 108.2022, 2));
          if (dist > 1) {
            setShowMockButtons(true);
          } else {
            setShowMockButtons(false);
          }

          setCurrentCoords({ lat: latitude, lng: longitude });
          fetchDataFromAPIAndDB(latitude, longitude);
        },
        (error) => {
          clearTimeout(safetyTimeout);
          console.error("GPS Error:", error);
          setLocationError(true);
          setShowMockButtons(true);
          fetchDataFromAPIAndDB(16.0683, 108.2022);
        },
        { 
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000 
        }
      );
    } else {
      setLocationError(true);
      setShowMockButtons(true);
      fetchDataFromAPIAndDB(16.0683, 108.2022);
    }
  };

  useEffect(() => {
    fetchPlaces(currentCoords || undefined);
  }, [selectedCategory]);

  const fetchDataFromAPIAndDB = (lat: number, lng: number) => {
    try {
      if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.places) {
        console.warn("Google Maps Places API not fully loaded, using DB only");
        useOnlyDB();
        return;
      }

      const pyrmont = new (window as any).google.maps.LatLng(lat, lng);
      const mapDiv = document.createElement('div');
      const service = new (window as any).google.maps.places.PlacesService(mapDiv);

      // Map categories to Google Places types
      const typeMapping: Record<string, string[]> = {
        '전체': ['restaurant', 'cafe', 'spa', 'store'],
        '로컬맛집': ['restaurant'],
        '관광맛집': ['restaurant'],
        '마사지': ['spa'],
        '마트·시장': ['store', 'supermarket', 'market'],
        '카페': ['cafe']
      };

      const types = typeMapping[selectedCategory] || ['restaurant'];

      const request = {
        location: pyrmont,
        radius: '1500',
        type: types[0]
      };

      service.nearbySearch(request, (results: any[], status: any) => {
        try {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
            const apiPlaces: PlaceData[] = results.map(result => ({
              id: result.place_id,
              name: result.name,
              category: selectedCategory === '전체' ? (result.types.includes('restaurant') ? '식당' : '장소') : selectedCategory,
              rating: result.rating || 0,
              distance: '주변',
              time: '가까움',
              cost: result.price_level ? '₩'.repeat(result.price_level) : '정보없음',
              isLocal: result.rating > 4.2 && result.user_ratings_total < 100, // Heuristic for local
              isGooglePlace: true,
              summary: {
                pros: `구글 실시간 데이터: 리뷰 ${result.user_ratings_total?.toLocaleString() || 0}개. ${result.vicinity}`,
                cons: result.business_status !== 'OPERATIONAL' ? '현재 영업 중이 아닐 수 있음' : '현장 확인 필요'
              }
            }));

            // Combine with DB as fallback/supplement
            const dbPlaces = getDBPlaces();
            setPlaces([...apiPlaces, ...dbPlaces]);
            setLoading(false);
          } else {
            console.warn("Google Places API failed or no results:", status);
            useOnlyDB();
          }
        } catch (innerError) {
          console.error("Inner API error:", innerError);
          useOnlyDB();
        }
      });
    } catch (e) {
      console.error("fetchDataFromAPIAndDB error:", e);
      useOnlyDB();
    }
  };

  const getDBPlaces = (): PlaceData[] => {
    const dbPlaces: PlaceData[] = [];
    const mapRestaurantToPlaceData = (r: any, isLocal: boolean): PlaceData => ({
      id: r.id, name: r.name_kr || r.name, category: isLocal ? '로컬맛집' : '관광맛집', rating: r.rating, distance: 'DB 추천', time: '-', cost: `${r.avg_cost_per_person?.toLocaleString() || 0}동~`, isLocal,
      summary: { pros: r.good_review, cons: r.bad_review }
    });
    
    const mapMassageToPlaceData = (m: any): PlaceData => ({
      id: m.id, name: m.name_kr || m.name, category: '마사지', rating: m.rating, distance: 'DB 추천', time: '-', cost: `${m.services?.[0]?.price?.toLocaleString() || 0}동~`, isLocal: m.type === 'local',
      summary: { pros: m.good_review, cons: m.bad_review }
    });

    if (selectedCategory === '전체' || selectedCategory === '로컬맛집') {
      db.restaurants.local.forEach(r => dbPlaces.push(mapRestaurantToPlaceData(r, true)));
    }
    if (selectedCategory === '전체' || selectedCategory === '관광맛집') {
      db.restaurants.tourist.forEach(r => dbPlaces.push(mapRestaurantToPlaceData(r, false)));
    }
    if (selectedCategory === '전체' || selectedCategory === '마사지') {
      db.massage_shops.forEach(m => dbPlaces.push(mapMassageToPlaceData(m)));
    }
    if (selectedCategory === '전체' || selectedCategory === '카페') {
      const allCafes = [...db.cafes.danang, ...db.cafes.hoian];
      allCafes.forEach(c => dbPlaces.push({
        id: c.id, name: c.name_kr || c.name, category: '카페', rating: c.rating, distance: 'DB 추천', time: '-', cost: `${c.avg_cost?.toLocaleString() || 0}동~`, isLocal: c.type === 'local',
        summary: { pros: c.good_review, cons: c.bad_review }
      }));
    }
    if (selectedCategory === '전체' || selectedCategory === '마트·시장') {
      const allMarkets = [...db.markets_marts.danang, ...db.markets_marts.hoian];
      allMarkets.forEach(m => dbPlaces.push({
        id: m.id, name: m.name_local || m.name, category: '마트·시장', rating: m.rating, distance: 'DB 추천', time: '-', cost: m.price_level, isLocal: m.type.includes('local'),
        summary: { pros: m.good_review, cons: m.bad_review }
      }));
    }
    return dbPlaces;
  };

  const useOnlyDB = () => {
    setPlaces(getDBPlaces());
    setLoading(false);
  };

  return (
    <div className="pb-10">
      {/* Test Mock Locations */}
      {showMockButtons && (
        <div className="px-4 mb-4">
          <p className="text-[10px] text-text-hint mb-2 flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5" /> 테스트용 가상 위치 (베트남 외 지역 접속 시 활성)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {MOCK_LOCATIONS.map(loc => (
              <button
                key={loc.name}
                onClick={() => fetchPlaces({ lat: loc.lat, lng: loc.lng })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all active:scale-95",
                  currentCoords?.lat === loc.lat ? "bg-coral text-white shadow-lg shadow-coral/20" : "bg-white/5 text-text-secondary border border-white/10"
                )}
              >
                {loc.name}
              </button>
            ))}
            <button
               onClick={() => {
                 setCurrentCoords(null);
                 fetchPlaces();
               }}
               className="px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-navy-sub text-text-hint border border-white/10 flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" /> GPS 초기화
            </button>
          </div>
        </div>
      )}

      {locationError && (
        <div className="px-4 mb-4">
          <div className="bg-coral/10 border border-coral/20 rounded-xl p-3 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-coral mt-0.5 shrink-0" />
            <p className="text-[11px] text-coral/90 leading-tight">
              현재 위치를 가져올 수 없어 기본 위치(다낭 시내) 기준으로 검색했습니다. GPS를 켜주세요.
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
        {(['전체', '로컬맛집', '관광맛집', '마사지', '마트·시장', '카페'] as Category[]).map(cat => (
          <CategoryButton
            key={cat}
            label={cat === '로컬맛집' ? '🇻🇳 로컬맛집' : cat === '관광맛집' ? '⭐ 관광맛집' : cat === '마사지' ? '💆 마사지' : cat === '마트·시장' ? '🛒 마트·시장' : cat === '카페' ? '☕ 카페' : '전체'}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* Places List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-hint">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <p className="text-xs">주변 장소를 실시간으로 탐색 중입니다...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-10 text-text-hint text-sm">
            해당 카테고리의 장소가 없습니다.
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              className={cn(
                "glass-card p-4 flex flex-col gap-3 transition-transform active:scale-[0.98]",
                place.isLocal ? "bg-card-local/80" : "bg-card-tourist/80",
                place.isGooglePlace && "ring-1 ring-blue-500/30"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    {place.isGooglePlace && (
                      <span className="flex items-center gap-1 bg-white text-navy text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/20">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                        <span className="ml-0.5 text-navy/70">실시간</span>
                      </span>
                    )}
                    {!place.isGooglePlace && (
                      <span className="bg-teal/20 text-teal text-[9px] px-1.5 py-0.5 rounded font-bold border border-teal/20">앱추천</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs">{place.category} • {place.cost}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-forsythia fill-forsythia" />
                  <span className="text-xs font-bold">{place.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>{place.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{place.time}</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' 베트남')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-[10px] font-bold transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  지도
                </a>
              </div>

              {/* Gemini Summary */}
              <div className="bg-navy-sub/50 rounded-xl p-3 text-[12px] leading-relaxed border border-white/5">
                <div className="flex items-start gap-2 mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-mint mt-0.5 shrink-0" />
                  <p><span className="text-mint font-bold">👍 좋은점:</span> {place.summary.pros}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-coral mt-0.5 shrink-0" />
                  <p><span className="text-coral font-bold">👎 아쉬운점:</span> {place.summary.cons}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
