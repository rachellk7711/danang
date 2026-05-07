/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useCallback } from 'react';
import { Star, MapPin, Loader2, RefreshCw, Plus } from 'lucide-react';
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
      active ? "bg-teal text-white shadow-lg" : "bg-gray-100 text-gray-500 border border-gray-200"
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
      } catch (err) {
        setPlaces(dbPlaces.sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999)));
      }
    } catch (err) {
      console.error(err);
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
        '전체': 'restaurant', '로컬맛집': 'vietnamese restaurant', '관광맛집': 'top rated restaurant', '마사지': 'massage spa', '마트·시장': 'market supermarket', '카페': 'cafe'
      };
      service.nearbySearch({
        location: center, radius: 1500, keyword: keywordMapping[selectedCategory] || 'restaurant', language: 'ko'
      }, (results: any, status: any) => {
        try { mapDiv.remove(); } catch (e) {}
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const apiPlaces = results.filter((r: any) => (r.rating || 0) >= 4.0).map((result: any) => ({
            id: result.place_id || Math.random().toString(),
            name: result.name || '장소명 없음',
            category: selectedCategory === '전체' ? '식당' : selectedCategory,
            rating: result.rating || 0,
            distance: '실시간 검색',
            time: '현재위치 기준',
            cost: result.price_level ? 'Google ' + result.price_level : '정보없음',
            isLocal: (result.rating || 0) > 4.3,
            isGooglePlace: true,
            summary: { pros: result.vicinity || '', cons: '현장 확인 필요' }
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
    if (exploreMode === 'recommend') loadRecommendPlaces(activeCoords);
    else searchGooglePlaces(activeCoords?.lat || 16.0683, activeCoords?.lng || 108.2234);
  }, [exploreMode, currentCoords, loadRecommendPlaces, searchGooglePlaces]);

  useEffect(() => {
    refreshData();
  }, [exploreMode, selectedCategory]);

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="p-4">
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setExploreMode('recommend')}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              exploreMode === 'recommend' ? "bg-teal text-white shadow-md" : "text-gray-400"
            )}
          >
            <Star className={cn("w-4 h-4", exploreMode === 'recommend' ? "fill-white" : "")} />
            추천 리스트
          </button>
          <button
            onClick={() => setExploreMode('google')}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              exploreMode === 'google' ? "bg-coral text-white shadow-md" : "text-gray-400"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            구글 실시간
          </button>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 relative overflow-hidden">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            {exploreMode === 'recommend' 
              ? '다낭 전문가가 엄선한 맛집과 내가 저장한 장소를 거리순으로 보여드려요.'
              : '현재 위치 반경 1.5km 이내의 구글 평점 4.0 이상 장소를 검색합니다.'}
          </p>
        </div>
      </div>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {MOCK_LOCATIONS.map(loc => (
          <button
            key={loc.name}
            onClick={() => {
              setIsMock(true);
              const c = { lat: loc.lat, lng: loc.lng };
              setCurrentCoords(c);
              refreshData(c);
            }}
            className={cn(
              "px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 border transition-all",
              currentCoords?.lat === loc.lat ? "bg-coral/10 border-coral text-coral" : "bg-white border-gray-200 text-gray-500"
            )}
          >
            {loc.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {(['전체', '로컬맛집', '관광맛집', '마사지', '마트·시장', '카페'] as Category[]).map(cat => (
            <CategoryButton
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center shadow-lg"><Plus className="w-5 h-5" /></button>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-teal mx-auto mb-2" /><p className="text-sm text-gray-400">데이터 로드 중...</p></div>
        ) : places.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">표시할 장소가 없습니다.</div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold text-teal bg-teal/5 px-2 py-0.5 rounded-md mb-1 inline-block">{place.category}</span>
                  <h4 className="text-base font-bold text-gray-800">{place.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-600">{place.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[11px] font-bold">{place.distance}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[9px] text-gray-400 font-bold mb-1">👍 포인트</p><p className="text-[10px] text-gray-700 leading-tight line-clamp-2">{place.summary.pros}</p></div>
                <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[9px] text-gray-400 font-bold mb-1">⚠️ 참고</p><p className="text-[10px] text-gray-700 leading-tight line-clamp-2">{place.summary.cons}</p></div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{place.cost}</span>
                <a href={place.location ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 text-xs font-bold border border-blue-100 px-3 py-1.5 rounded-xl hover:bg-blue-50">지도로 보기</a>
              </div>
            </div>
          ))
        )}
      </div>
      <AddPlaceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); refreshData(); }} />
    </div>
  );
};
