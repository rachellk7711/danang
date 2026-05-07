import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Navigation, Clock, MessageCircle, MapPin, Loader2, RefreshCw, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category } from '../types';
import DB from '../data/db.json';
import type { DBContent } from '../types';
import { useLocation } from '../contexts/LocationContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AddPlaceModal } from '../components/AddPlaceModal';
import type { UserPlace } from '../types';

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
  distanceVal?: number;
  time: string;
  cost: string;
  isLocal: boolean;
  location?: { lat: number; lng: number };
  summary: {
    pros: string;
    cons: string;
  };
  isGooglePlace?: boolean;
  isUserPlace?: boolean;
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
  { name: '🏮 올드타운', lat: 15.8801, lng: 108.3380 },
  { name: '🏖️ 안방비치', lat: 15.9060, lng: 108.3710 },
];

export const ExplorePage = () => {
  const { coords: currentCoords, setCoords: setCurrentCoords, setIsMock } = useLocation();
  const [exploreMode, setExploreMode] = useState<'recommend' | 'google'>('recommend');
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [showMockButtons, setShowMockButtons] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (exploreMode !== 'google') {
      setApiStatus('idle');
      setApiErrorMessage(null);
      return;
    }
    
    if ((window as any).google?.maps?.places) {
      setApiStatus('success');
      return;
    }

    setApiStatus('loading');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey.startsWith('%')) {
      console.error("Invalid or missing Google Maps API Key");
      setApiStatus('error');
      setApiErrorMessage("구글 지도 API 키가 설정되지 않았습니다.");
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        if ((window as any).google?.maps?.places) {
          clearInterval(interval);
          setApiStatus('success');
        } else if (checkCount > 40) { // Increase wait time to 20s
          clearInterval(interval);
          setApiStatus('error');
          setApiErrorMessage("구글 지도 라이브러리를 불러오지 못했습니다.");
        }
      }, 500);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ko&region=VN`;
    script.async = true;
    script.defer = true;
    script.onload = () => setApiStatus('success');
    script.onerror = () => {
      setApiStatus('error');
      setApiErrorMessage("구글 지도 스크립트 로드에 실패했습니다.");
    };
    document.head.appendChild(script);
  }, [exploreMode]);

  useEffect(() => {
    if (loading) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        console.warn("Global safety timeout (60s) triggered - forcing DB fallback");
        if (loading) {
          setApiErrorMessage("검색 시간이 초과되어 추천 리스트를 대신 표시합니다.");
          useOnlyDB();
        }
      }, 60000);
    } else {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, exploreMode, apiStatus, currentCoords]);

  const fetchPlaces = useCallback((forcedCoords?: {lat: number, lng: number}) => {
    try {
      setLoading(true);
      setLocationError(false);
      setApiErrorMessage(null);

      // Handle forced coordinates (mock buttons) immediately
      if (forcedCoords) {
        setCurrentCoords(forcedCoords);
        if (exploreMode === 'recommend') {
          useOnlyDB(forcedCoords);
          return;
        }
        fetchDataFromAPI(forcedCoords.lat, forcedCoords.lng);
        return;
      }

      if (exploreMode === 'recommend') {
        useOnlyDB();
        return;
      }
      
      if (apiStatus === 'error') {
        useOnlyDB();
        return;
      }
      
      if (apiStatus !== 'success') {
        return;
      }
      
      if (currentCoords) {
        fetchDataFromAPI(currentCoords.lat, currentCoords.lng);
        return;
      }

      requestGPSAndFetch();
    } catch (err) {
      console.error("Critical error in fetchPlaces:", err);
      useOnlyDB();
    }
  }, [exploreMode, apiStatus, currentCoords]);

  const useOnlyDB = useCallback(async (overrideCoords?: {lat: number, lng: number}) => {
    setLoading(true);
    try {
      const dbPlaces = getDBPlaces(overrideCoords);
      
      if (!isSupabaseConfigured) {
        setPlaces(dbPlaces);
        setLoading(false);
        return;
      }

      // Fetch from Supabase
      const { data: userPlaces, error } = await supabase
        .from('user_places')
        .select('*');

      if (!error && userPlaces) {
        const mappedUserPlaces: PlaceData[] = userPlaces.map((p: UserPlace) => {
          let distance = '정보없음';
          let distanceVal = 999;
          const activeCoords = overrideCoords || currentCoords;

          if (activeCoords?.lat && activeCoords?.lng && p.location) {
            const d = calculateDistance(activeCoords.lat, activeCoords.lng, p.location.lat, p.location.lng);
            distanceVal = d;
            distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
          }

          return {
            id: p.id || String(Math.random()),
            name: p.name,
            category: p.category,
            rating: p.rating,
            distance,
            distanceVal,
            time: '내 장소',
            cost: p.avg_cost || '-',
            isLocal: true,
            isUserPlace: true,
            location: p.location,
            summary: {
              pros: p.good_review,
              cons: p.bad_review
            }
          };
        });

        // Filter by category if not '전체'
        const filteredUserPlaces = selectedCategory === '전체' 
          ? mappedUserPlaces 
          : mappedUserPlaces.filter(p => p.category === selectedCategory);

        const merged = [...dbPlaces, ...filteredUserPlaces].sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999));
        setPlaces(merged);
      } else {
        setPlaces(dbPlaces);
      }
    } catch (err) {
      console.error("Error fetching user places:", err);
      setPlaces(getDBPlaces(overrideCoords));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentCoords]);

  const requestGPSAndFetch = () => {
    if (navigator.geolocation) {
      const gpsTimeout = window.setTimeout(() => {
        setLocationError(true);
        setShowMockButtons(true);
        // Fallback to Han Market if GPS times out
        fetchDataFromAPI(16.0683, 108.2234);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          window.clearTimeout(gpsTimeout);
          const { latitude, longitude } = position.coords;
          // Distance from Da Nang city center
          const dist = Math.sqrt(Math.pow(latitude - 16.0544, 2) + Math.pow(longitude - 108.2022, 2));
          setShowMockButtons(dist > 0.5); // Show mock buttons if more than ~50km away

          const coords = { lat: latitude, lng: longitude };
          setCurrentCoords(coords);
          fetchDataFromAPI(latitude, longitude);
        },
        (error) => {
          window.clearTimeout(gpsTimeout);
          setLocationError(true);
          setShowMockButtons(true);
          fetchDataFromAPI(16.0683, 108.2234);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationError(true);
      setShowMockButtons(true);
      fetchDataFromAPI(16.0683, 108.2234);
    }
  };

  const fetchDataFromAPI = (lat: number, lng: number) => {
    try {
      if (!(window as any).google?.maps?.places) {
        setApiErrorMessage("구글 지도 서비스를 사용할 수 없습니다.");
        useOnlyDB();
        return;
      }

      const center = new (window as any).google.maps.LatLng(lat, lng);
      
      const mapDiv = document.createElement('div');
      mapDiv.id = 'places-container';
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      const service = new (window as any).google.maps.places.PlacesService(mapDiv);

      const keywordMapping: Record<string, string> = {
        '전체': 'restaurant',
        '로컬맛집': 'vietnamese restaurant',
        '관광맛집': 'famous restaurant',
        '마사지': 'spa massage',
        '마트·시장': 'market',
        '카페': 'cafe'
      };

      const request = {
        location: center,
        radius: 1500, // 1.5km
        keyword: keywordMapping[selectedCategory] || 'restaurant',
        language: 'ko'
      };

      service.nearbySearch(request, (results: any[], status: any) => {
        try { document.getElementById('places-container')?.remove(); } catch (e) {}

        const PlacesStatus = (window as any).google.maps.places.PlacesServiceStatus;
        
        if (status === PlacesStatus.OK && results) {
          const apiPlaces: PlaceData[] = results
            .filter(r => (r.rating || 0) >= 4.0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .map(result => ({
              id: result.place_id,
              name: result.name,
              category: selectedCategory === '전체' ? (result.types.includes('restaurant') ? '식당' : result.types.includes('cafe') ? '카페' : '장소') : selectedCategory,
              rating: result.rating || 0,
              distance: '실시간 검색',
              time: '현재위치 기준',
              cost: result.price_level ? '₩'.repeat(result.price_level) : '정보없음',
              isLocal: result.rating > 4.3 && result.user_ratings_total < 300,
              isGooglePlace: true,
              summary: {
                pros: `구글 실시간: 리뷰 ${result.user_ratings_total?.toLocaleString() || 0}개. ${result.vicinity}`,
                cons: result.business_status !== 'OPERATIONAL' ? '현재 영업 중이 아닐 수 있음' : '현장 확인 필요'
              }
            }));

          setPlaces(apiPlaces);
          setLoading(false);
          setApiErrorMessage(null);
        } else if (status === PlacesStatus.ZERO_RESULTS) {
          setPlaces([]);
          setLoading(false);
        } else {
          console.error("Google Places Search Error:", status);
          setApiErrorMessage(`구글 검색 오류: ${status}. 추천 리스트로 전환합니다.`);
          useOnlyDB();
        }
      });
    } catch (e) {
      console.error("Error in fetchDataFromAPI:", e);
      setApiErrorMessage("네트워크 오류로 추천 리스트로 전환합니다.");
      useOnlyDB();
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDBPlaces = (overrideCoords?: {lat: number, lng: number}): PlaceData[] => {
    const dbPlaces: PlaceData[] = [];
    const activeCoords = overrideCoords || currentCoords;

    const mapToPlaceData = (item: any, catName: string): PlaceData => {
      let distance = '정보없음';
      let distanceVal = 999;
      
      if (!item) return { 
        id: Math.random().toString(), name: '정보 없음', category: catName, rating: 0, 
        distance: '-', distanceVal: 999, time: '-', cost: '-', isLocal: false, 
        summary: { pros: '', cons: '' } 
      };

      let itemLat = item.location?.lat;
      let itemLng = item.location?.lng;
      let isEstimated = false;

      if (!itemLat && item.city) {
        isEstimated = true;
        if (item.city === 'danang') {
          itemLat = 16.0544; itemLng = 108.2022;
        } else if (item.city === 'hoian') {
          itemLat = 15.8801; itemLng = 108.3380;
        }
      }

      if (activeCoords?.lat && activeCoords?.lng && itemLat && itemLng) {
        const d = calculateDistance(activeCoords.lat, activeCoords.lng, itemLat, itemLng);
        distanceVal = d;
        const distStr = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
        distance = isEstimated ? `약 ${distStr}` : distStr;
      }

      // Safe cost extraction
      let costStr = '정보없음';
      if (item.avg_cost_per_person) costStr = `${Number(item.avg_cost_per_person).toLocaleString()}동~`;
      else if (item.avg_cost) costStr = `${Number(item.avg_cost).toLocaleString()}동~`;
      else if (item.services?.[0]?.price) costStr = `${Number(item.services[0].price).toLocaleString()}동~`;
      else if (item.price_level) costStr = String(item.price_level);

      return {
        id: String(item.id || Math.random()),
        name: String(item.name_kr || item.name || '이름 없음'),
        category: catName,
        rating: Number(item.rating || item.local_rating || 0),
        distance,
        distanceVal,
        time: '-',
        cost: costStr,
        isLocal: !!(String(item.type || '').includes('local')),
        summary: {
          pros: String(item.good_review || item.description || ''),
          cons: String(item.bad_review || '검증된 장소')
        }
      };
    };

    if (selectedCategory === '전체' || selectedCategory === '로컬맛집') {
      db.restaurants.local.forEach(r => dbPlaces.push(mapToPlaceData(r, '로컬맛집')));
    }
    if (selectedCategory === '전체' || selectedCategory === '관광맛집') {
      db.restaurants.tourist.forEach(r => dbPlaces.push(mapToPlaceData(r, '관광맛집')));
    }
    if (selectedCategory === '전체' || selectedCategory === '마사지') {
      db.massage_shops.forEach(m => dbPlaces.push(mapToPlaceData(m, '마사지')));
    }
    if (selectedCategory === '전체' || selectedCategory === '카페') {
      const allCafes = [...db.cafes.danang, ...db.cafes.hoian];
      allCafes.forEach(c => dbPlaces.push(mapToPlaceData(c, '카페')));
    }
    if (selectedCategory === '전체' || selectedCategory === '마트·시장') {
      const allMarkets = [...db.markets_marts.danang, ...db.markets_marts.hoian];
      allMarkets.forEach(m => dbPlaces.push(mapToPlaceData(m, '마트·시장')));
    }

    // Sort by distance if coordinates available
    return dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999));
  };



  return (
    <div className="pb-10">
      {/* Explore Mode Selector */}
      <div className="px-4 mb-6">
        <div className="bg-navy-sub/50 p-1 rounded-2xl border border-white/5 flex gap-1">
          <button
            onClick={() => setExploreMode('recommend')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
              exploreMode === 'recommend' ? "bg-teal text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", exploreMode === 'recommend' ? "fill-white" : "")} />
            앱 추천 리스트
          </button>
          <button
            onClick={() => setExploreMode('google')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
              exploreMode === 'google' ? "bg-blue-500 text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            구글 실시간 (1km)
          </button>
        </div>
        <div className="mt-2 px-1 flex items-center gap-1.5">
          {exploreMode === 'recommend' ? (
            <>
              <Star className="w-3 h-3 text-teal fill-teal" />
              <p className="text-[10px] text-text-hint">다낭/호이안 전문가가 직접 엄선한 검증된 맛집 목록입니다.</p>
            </>
          ) : (
            <>
              <MapPin className="w-3 h-3 text-blue-500" />
              <p className="text-[10px] text-text-hint">
                <span className="text-blue-500 font-bold">
                  [{currentCoords ? (
                    currentCoords.lat === 16.0683 ? "한시장" : 
                    currentCoords.lat === 16.0471 ? "미케비치" : 
                    currentCoords.lat === 15.9973 ? "바나힐" :
                    currentCoords.lat === 15.8801 ? "올드타운" :
                    currentCoords.lat === 15.9060 ? "안방비치" :
                    "현재 위치"
                  ) : "위치 파악 중"}]
                </span> 반경 1km 이내, 구글 평점 4.0 이상 장소를 검색합니다.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Test Mock Locations */}
      <div className="px-4 mb-4">
          <p className="text-[10px] text-text-hint mb-2 flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5" /> 테스트용 가상 위치 (베트남 외 지역 접속 시 활성)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {MOCK_LOCATIONS.map(loc => (
              <button
                key={loc.name}
                onClick={() => {
                  setIsMock(true);
                  fetchPlaces({ lat: loc.lat, lng: loc.lng });
                }}
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
                 setIsMock(false);
                 setCurrentCoords(null);
                 fetchPlaces();
               }}
               className="px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-navy-sub text-text-hint border border-white/10 flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" /> GPS 초기화
            </button>
          </div>
        </div>

      {exploreMode === 'google' && locationError && (
        <div className="px-4 mb-4">
          <div className="bg-coral/10 border border-coral/20 rounded-xl p-3 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-coral mt-0.5 shrink-0" />
            <p className="text-[11px] text-coral/90 leading-tight">
              현재 위치를 가져올 수 없어 기본 위치(한시장 인근) 기준으로 검색했습니다. GPS를 켜주세요.
            </p>
          </div>
        </div>
      )}

      {exploreMode === 'google' && apiErrorMessage && (
        <div className="px-4 mb-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-blue-500/90 leading-tight font-bold mb-1">
                구글 실시간 검색 안내
              </p>
              <p className="text-[10px] text-text-secondary leading-tight">
                {apiErrorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 px-4 pb-4 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {(['전체', '로컬맛집', '관광맛집', '마사지', '마트·시장', '카페'] as Category[]).map(cat => (
            <CategoryButton
              key={cat}
              label={cat === '로컬맛집' ? '🇻🇳 로컬맛집' : cat === '관광맛집' ? '⭐ 관광맛집' : cat === '마사지' ? '💆 마사지' : cat === '마트·시장' ? '🛒 마트·시장' : cat === '카페' ? '☕ 카페' : '전체'}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
        {exploreMode === 'recommend' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-shrink-0 w-8 h-8 bg-teal/10 border border-teal/30 text-teal rounded-full flex items-center justify-center hover:bg-teal/20 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Places List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-hint">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <p className="text-xs">주변 장소를 실시간으로 탐색 중입니다...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-text-hint/30" />
            </div>
            <p className="text-sm text-text-hint">
              {exploreMode === 'google' 
                ? "반경 1km 내에 평점 4.0 이상의 장소가 없습니다." 
                : "해당 카테고리의 장소가 없습니다."}
            </p>
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
                    {place.isUserPlace && (
                      <span className="bg-mango/20 text-mango text-[9px] px-1.5 py-0.5 rounded font-bold border border-mango/20">내 장소</span>
                    )}
                    {!place.isGooglePlace && !place.isUserPlace && (
                      <span className="bg-teal/20 text-teal text-[9px] px-1.5 py-0.5 rounded font-bold border border-teal/20">앱추천</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs">{place.category} • {place.cost}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-forsythia fill-forsythia" />
                    <span className="text-xs font-bold">{place.rating}</span>
                  </div>
                  <span className="text-[10px] text-teal font-bold">{place.distance}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{place.time}</span>
                  </div>
                </div>

                <a
                  href={place.location 
                    ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' 베트남')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-[10px] font-bold transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  지도
                </a>
              </div>

              {/* Summary */}
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

      <AddPlaceModal 
        isOpen={isAddModalOpen} 
        onClose={useCallback(() => setIsAddModalOpen(false), [])} 
        onSuccess={useCallback(() => fetchPlaces(), [fetchPlaces])} 
      />
    </div>
  );
};
