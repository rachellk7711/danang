/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Navigation, Clock, MapPin, Loader2, RefreshCw, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category, PlaceData } from '../types';
import db from '../../danang_content_db.json';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '../services/supabaseClient';
import { AddPlaceModal } from '../components/AddPlaceModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  { name: '⛩️ 호이안', lat: 15.8801, lng: 108.3380 },
  { name: '⛰️ 선짜', lat: 16.1215, lng: 108.2778 }
];

export const ExplorePage = () => {
  const { coords: currentCoords, setCoords: setCurrentCoords, setIsMock, isMock } = useLocation();
  const [exploreMode, setExploreMode] = useState<'recommend' | 'google'>('recommend');
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const checkGoogleApi = () => {
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        const google = (window as any).google;
        if (google?.maps?.places) {
          clearInterval(interval);
        } else if (checkCount > 40) { 
          clearInterval(interval);
          useOnlyDB();
        }
      }, 500);
      return () => clearInterval(interval);
    };

    if (!(window as any).google?.maps?.places) {
      checkGoogleApi();
    }
  }, [exploreMode]);

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

  const useOnlyDB = useCallback(async (overrideCoords?: {lat: number, lng: number}) => {
    setLoading(true);
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
        location: item.location,
        summary: {
          pros: String(item.good_review || item.description || ''),
          cons: String(item.bad_review || '검증된 장소')
        }
      };
    };

    const database = db as any;

    if (selectedCategory === '전체' || selectedCategory === '로컬맛집') {
      database.restaurants.local.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '로컬맛집')));
    }
    if (selectedCategory === '전체' || selectedCategory === '관광맛집') {
      database.restaurants.tourist.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '관광맛집')));
    }
    if (selectedCategory === '전체' || selectedCategory === '마사지') {
      database.massage_shops.forEach((m: any) => dbPlaces.push(mapToPlaceData(m, '마사지')));
    }
    if (selectedCategory === '전체' || selectedCategory === '카페') {
      const allCafes = [...database.cafes.danang, ...database.cafes.hoian];
      allCafes.forEach((c: any) => dbPlaces.push(mapToPlaceData(c, '카페')));
    }
    if (selectedCategory === '전체' || selectedCategory === '마트·시장') {
      const allMarkets = [...database.markets_marts.danang, ...database.markets_marts.hoian];
      allMarkets.forEach((m: any) => dbPlaces.push(mapToPlaceData(m, '마트·시장')));
    }

    try {
      const { data: userPlaces } = await supabase.from('user_places').select('*');
      if (userPlaces) {
        const mappedUserPlaces = userPlaces.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          rating: p.rating,
          distance: activeCoords ? `${calculateDistance(activeCoords.lat, activeCoords.lng, p.location.lat, p.location.lng).toFixed(1)}km` : '-',
          distanceVal: activeCoords ? calculateDistance(activeCoords.lat, activeCoords.lng, p.location.lat, p.location.lng) : 999,
          time: '내 장소',
          cost: p.avg_cost || '-',
          isLocal: true,
          isUserPlace: true,
          location: p.location,
          summary: {
            pros: p.good_review,
            cons: p.bad_review
          }
        }));

        const filteredUserPlaces = selectedCategory === '전체' 
          ? mappedUserPlaces 
          : mappedUserPlaces.filter((p: any) => p.category === selectedCategory);
        
        const merged = [...dbPlaces, ...filteredUserPlaces].sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999));
        setPlaces(merged);
      } else {
        setPlaces(dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999)));
      }
    } catch (err) {
      console.error("Supabase Error:", err);
      setPlaces(dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999)));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentCoords]);

  const fetchDataFromAPI = useCallback((lat: number, lng: number) => {
    try {
      const google = (window as any).google;
      if (!google?.maps?.places) {
        useOnlyDB();
        return;
      }

      const center = new google.maps.LatLng(lat, lng);
      const mapDiv = document.createElement('div');
      mapDiv.id = 'places-container';
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      const service = new google.maps.places.PlacesService(mapDiv);
      const keywordMapping: Record<string, string> = {
        '전체': 'restaurant',
        '로컬맛집': 'vietnamese restaurant',
        '관광맛집': 'top rated restaurant',
        '마사지': 'massage spa',
        '마트·시장': 'market supermarket',
        '카페': 'cafe'
      };

      const request = {
        location: center,
        radius: 1500,
        keyword: keywordMapping[selectedCategory] || 'restaurant',
        language: 'ko'
      };

      service.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: any) => {
        try { document.getElementById('places-container')?.remove(); } catch (e) {}

        const google = (window as any).google;
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const apiPlaces: PlaceData[] = results
            .filter(r => (r.rating || 0) >= 4.0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .map(result => ({
              id: result.place_id || Math.random().toString(),
              name: result.name || '장소명 없음',
              category: selectedCategory === '전체' ? (result.types?.includes('restaurant') ? '식당' : result.types?.includes('cafe') ? '카페' : '장소') : selectedCategory,
              rating: result.rating || 0,
              distance: '실시간 검색',
              time: '현재위치 기준',
              cost: result.price_level ? 'Google ' + result.price_level : '정보없음',
              isLocal: (result.rating || 0) > 4.3 && (result.user_ratings_total || 0) < 300,
              isGooglePlace: true,
              summary: {
                pros: `구글 실시간: 리뷰 ${(result.user_ratings_total || 0).toLocaleString()}개. ${result.vicinity || ''}`,
                cons: result.business_status !== 'OPERATIONAL' ? '현재 영업 중이 아닐 수 있음' : '현장 확인 필요'
              }
            }));
          setPlaces(apiPlaces);
          setLoading(false);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPlaces([]);
          setLoading(false);
        } else {
          useOnlyDB();
        }
      });
    } catch (e) {
      console.error("Error in fetchDataFromAPI:", e);
      useOnlyDB();
    }
  }, [selectedCategory, useOnlyDB]);

  const fetchPlaces = useCallback(async (forcedCoords?: {lat: number, lng: number}) => {
    setLoading(true);
    setLocationError(false);

    if (forcedCoords) {
      setCurrentCoords(forcedCoords);
      if (exploreMode === 'recommend') {
        useOnlyDB(forcedCoords);
      } else {
        fetchDataFromAPI(forcedCoords.lat, forcedCoords.lng);
      }
      return;
    }

    if (currentCoords) {
      if (exploreMode === 'recommend') {
        useOnlyDB(currentCoords);
      } else {
        fetchDataFromAPI(currentCoords.lat, currentCoords.lng);
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationError(true);
      useOnlyDB(MOCK_LOCATIONS[0]);
      return;
    }

    const gpsTimeout = window.setTimeout(() => {
      setLocationError(true);
      fetchDataFromAPI(16.0683, 108.2234);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(gpsTimeout);
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setCurrentCoords(coords);
        if (exploreMode === 'recommend') {
          useOnlyDB(coords);
        } else {
          fetchDataFromAPI(latitude, longitude);
        }
      },
      (error) => {
        window.clearTimeout(gpsTimeout);
        console.error("GPS Error:", error);
        setLocationError(true);
        useOnlyDB(MOCK_LOCATIONS[0]);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [exploreMode, selectedCategory, currentCoords, useOnlyDB, fetchDataFromAPI, setCurrentCoords]);

  useEffect(() => {
    fetchPlaces();
  }, [exploreMode, selectedCategory]);

  return (
    <div className="pb-24 animate-in fade-in duration-500 overflow-visible">
      {/* Search Mode Toggle */}
      <div className="p-4">
        <div className="flex bg-navy-sub p-1 rounded-2xl border border-white/5 relative z-20">
          <button
            onClick={() => setExploreMode('recommend')}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              exploreMode === 'recommend' ? "bg-teal text-white shadow-lg" : "text-text-hint hover:text-text-secondary"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", exploreMode === 'recommend' ? "fill-white" : "")} />
            추천 리스트
          </button>
          <button
            onClick={() => setExploreMode('google')}
            className={cn(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              exploreMode === 'google' ? "bg-coral text-white shadow-lg" : "text-text-hint hover:text-text-secondary"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            구글 실시간
          </button>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-navy-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Navigation className="w-12 h-12 text-teal" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
            실시간 거리순 탐색
          </h3>
          {exploreMode === 'recommend' ? (
            <p className="text-xs text-text-hint leading-relaxed">
              다낭 현지인이 검증한 로컬 맛집과 스팟을<br />
              내 위치에서 가장 가까운 순서로 보여드려요.
            </p>
          ) : (
            <p className="text-xs text-text-hint leading-relaxed mb-3">
              현재 [<span className="text-coral font-bold">
                {currentCoords ? (
                  isMock ? MOCK_LOCATIONS.find(l => l.lat === currentCoords.lat)?.name.replace('📍 ','').replace('🌊 ','').replace('⛩️ ','').replace('⛰️ ','') : "현재 위치"
                ) : "위치 파악 중"}]
              </span> 반경 1km 이내, 구글 평점 4.0 이상 장소를 검색합니다.
            </p>
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

      {/* Categories */}
      <div className="flex items-center gap-2 px-4 pb-4 overflow-hidden relative z-20">
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
             <div className="w-16 h-16 bg-navy-sub rounded-full flex items-center justify-center">
               <MapPin className="w-8 h-8 text-text-hint/20" />
             </div>
             <p className="text-sm text-text-hint">주변에 검색된 장소가 없습니다.<br />검색 범위를 조절하거나 카테고리를 바꿔보세요.</p>
          </div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="bg-navy-card border border-white/5 rounded-3xl p-5 hover:border-teal/30 transition-all group animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-teal uppercase tracking-tighter bg-teal/10 px-1.5 py-0.5 rounded">
                      {place.category}
                    </span>
                    {place.isUserPlace && (
                      <span className="bg-mango/20 text-mango text-[9px] px-1.5 py-0.5 rounded font-bold border border-mango/20">내 장소</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm font-black text-white">{place.name}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-forsythia fill-forsythia" />
                      <span className="text-[11px] font-bold text-white">{place.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                   <div className="flex items-center gap-1 text-teal mb-1">
                     <MapPin className="w-3 h-3" />
                     <span className="text-[11px] font-black">{place.distance}</span>
                   </div>
                   <div className="flex items-center gap-1 text-text-hint">
                     <Clock className="w-3 h-3" />
                     <span className="text-[10px] font-bold">{place.time}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-navy p-2.5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-text-hint font-bold uppercase mb-1">👍 추천 이유</p>
                   <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{place.summary.pros}</p>
                </div>
                <div className="bg-navy p-2.5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-text-hint font-bold uppercase mb-1">⚠️ 참고사항</p>
                   <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{place.summary.cons}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                     <span className="text-[10px] font-black text-white">{place.cost}</span>
                   </div>
                   {place.isLocal && (
                     <div className="flex items-center gap-1 px-2 py-1 bg-coral/10 text-coral rounded-lg border border-coral/20">
                       <span className="text-[9px] font-bold">LOCAL ONLY</span>
                     </div>
                   )}
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
            </div>
          ))
        )}
      </div>

      <AddPlaceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchPlaces();
        }} 
      />
    </div>
  );
};
