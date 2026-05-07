/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Navigation, MapPin, Loader2, RefreshCw, Plus } from 'lucide-react';
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
  const { coords: currentCoords, setCoords: setCurrentCoords, setIsMock } = useLocation();
  const [exploreMode, setExploreMode] = useState<'recommend' | 'google'>('recommend');
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const loadRecommendPlaces = useCallback(async (coords: {lat: number, lng: number} | null) => {
    setLoading(true);
    try {
      const dbPlaces: PlaceData[] = [];
      const database = db as any;

      const mapToPlaceData = (item: any, catName: string): PlaceData => {
        let distance = '정보없음';
        let distanceVal = 999;
        
        const itemLat = item.location?.lat || (item.city === 'danang' ? 16.0544 : item.city === 'hoian' ? 15.8801 : null);
        const itemLng = item.location?.lng || (item.city === 'danang' ? 108.2022 : item.city === 'hoian' ? 108.3380 : null);

        if (coords?.lat && coords?.lng && itemLat && itemLng) {
          const d = calculateDistance(coords.lat, coords.lng, itemLat, itemLng);
          distanceVal = d;
          distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
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
          location: { lat: itemLat, lng: itemLng },
          summary: {
            pros: String(item.good_review || item.description || ''),
            cons: String(item.bad_review || '추천 장소')
          }
        };
      };

      // Safe JSON Mapping
      if (database.restaurants) {
        if ((selectedCategory === '전체' || selectedCategory === '로컬맛집') && database.restaurants.local) {
          database.restaurants.local.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '로컬맛집')));
        }
        if ((selectedCategory === '전체' || selectedCategory === '관광맛집') && database.restaurants.tourist) {
          database.restaurants.tourist.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '관광맛집')));
        }
      }
      
      if (database.massage_shops && (selectedCategory === '전체' || selectedCategory === '마사지')) {
        database.massage_shops.forEach((m: any) => dbPlaces.push(mapToPlaceData(m, '마사지')));
      }

      // Supabase Load
      try {
        const { data: userPlaces } = await supabase.from('user_places').select('*');
        if (userPlaces) {
          const mappedUserPlaces = userPlaces.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            rating: p.rating,
            distance: coords ? `${calculateDistance(coords.lat, coords.lng, p.location.lat, p.location.lng).toFixed(1)}km` : '-',
            distanceVal: coords ? calculateDistance(coords.lat, coords.lng, p.location.lat, p.location.lng) : 999,
            time: '내 장소',
            cost: p.avg_cost || '-',
            isLocal: true,
            isUserPlace: true,
            location: p.location,
            summary: { pros: p.good_review, cons: p.bad_review }
          }));

          const filteredUserPlaces = selectedCategory === '전체' 
            ? mappedUserPlaces 
            : mappedUserPlaces.filter((p: any) => p.category === selectedCategory);
          
          const merged = [...dbPlaces, ...filteredUserPlaces].sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999));
          setPlaces(merged);
        } else {
          setPlaces(dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999)));
        }
      } catch (supabaseErr) {
        console.error("Supabase error, using only DB:", supabaseErr);
        setPlaces(dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999)));
      }
    } catch (err) {
      console.error("Critical Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const searchGooglePlaces = useCallback((lat: number, lng: number) => {
    setLoading(true);
    try {
      const google = (window as any).google;
      if (!google?.maps?.places) {
        loadRecommendPlaces(null);
        return;
      }

      const center = new google.maps.LatLng(lat, lng);
      const mapDiv = document.createElement('div');
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

      service.nearbySearch({
        location: center,
        radius: 1500,
        keyword: keywordMapping[selectedCategory] || 'restaurant',
        language: 'ko'
      }, (results: google.maps.places.PlaceResult[] | null, status: any) => {
        try { mapDiv.remove(); } catch (e) {}
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
        } else {
          loadRecommendPlaces({ lat, lng });
        }
      });
    } catch (e) {
      loadRecommendPlaces({ lat, lng });
    }
  }, [selectedCategory, loadRecommendPlaces]);

  const refreshData = useCallback((forcedCoords?: {lat: number, lng: number}) => {
    const activeCoords = forcedCoords || currentCoords;
    if (exploreMode === 'recommend') {
      loadRecommendPlaces(activeCoords);
    } else {
      if (activeCoords) {
        searchGooglePlaces(activeCoords.lat, activeCoords.lng);
      } else {
        searchGooglePlaces(16.0683, 108.2234);
      }
    }
  }, [exploreMode, currentCoords, loadRecommendPlaces, searchGooglePlaces]);

  useEffect(() => {
    refreshData();
  }, [exploreMode, selectedCategory]);

  return (
    <div className="pb-24 animate-in fade-in duration-500 overflow-visible">
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
            {exploreMode === 'recommend' ? '현지인 추천 스팟' : '주변 실시간 탐색'}
          </h3>
          <p className="text-xs text-text-hint leading-relaxed">
            {exploreMode === 'recommend' 
              ? '다낭 전문가가 엄선한 맛집과 내가 저장한 장소를 거리순으로 보여드려요.'
              : '현재 위치 반경 1.5km 이내의 구글 평점 4.0 이상 장소를 실시간으로 검색합니다.'}
          </p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {MOCK_LOCATIONS.map(loc => (
            <button
              key={loc.name}
              onClick={() => {
                setIsMock(true);
                const coords = { lat: loc.lat, lng: loc.lng };
                setCurrentCoords(coords);
                refreshData(coords);
              }}
              className={cn(
                "px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all active:scale-95 border",
                currentCoords?.lat === loc.lat ? "bg-coral/10 border-coral text-coral" : "bg-white/5 text-text-hint border-white/5"
              )}
            >
              {loc.name}
            </button>
          ))}
          <button
             onClick={() => {
               setIsMock(false);
               setCurrentCoords(null);
               refreshData();
             }}
             className="px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 bg-navy-sub text-text-hint border border-white/10 flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" /> GPS 초기화
          </button>
        </div>
      </div>

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
            className="flex-shrink-0 w-10 h-10 bg-teal/10 border border-teal/30 text-teal rounded-full flex items-center justify-center hover:bg-teal/20 transition-all shadow-lg shadow-teal/10"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-hint">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <p className="text-xs">데이터를 불러오는 중입니다...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
             <MapPin className="w-12 h-12 text-text-hint/20" />
             <p className="text-sm text-text-hint">장소가 없습니다. 다른 카테고리를 선택해 보세요.</p>
          </div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="bg-navy-card border border-white/5 rounded-3xl p-5 hover:border-teal/30 transition-all animate-in slide-in-from-bottom-4 duration-500">
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
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-navy p-2.5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-text-hint font-bold uppercase mb-1">👍 포인트</p>
                   <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{place.summary.pros}</p>
                </div>
                <div className="bg-navy p-2.5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-text-hint font-bold uppercase mb-1">⚠️ 주의/팁</p>
                   <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{place.summary.cons}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-black text-white">{place.cost}</span>
                </div>
                <a
                  href={place.location 
                    ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' 베트남')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl text-[10px] font-bold transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  지도보기
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
          refreshData();
        }} 
      />
    </div>
  );
};
