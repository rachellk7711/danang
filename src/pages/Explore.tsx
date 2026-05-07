/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Manual Coordinate Map for items missing location in JSON
const MANUAL_COORDS: Record<string, {lat: number, lng: number}> = {
  "han_market": { lat: 16.0683, lng: 108.2234 },
  "lotte_mart": { lat: 16.0371, lng: 108.2268 },
  "dn_009": { lat: 16.0683, lng: 108.2234 }, // 한시장
  "dn_010": { lat: 16.0371, lng: 108.2268 }, // 롯데마트
  "lr_001": { lat: 16.0712, lng: 108.2198 }, // 분보후에 46
  "lr_002": { lat: 16.0654, lng: 108.2212 }, // 포 29
  "lr_003": { lat: 16.0645, lng: 108.2256 }, // 껌가 아하이
  "lr_004": { lat: 16.0744, lng: 108.2166 }, // 미꽝 24/7
  "lr_005": { lat: 16.0588, lng: 108.2215 }, // 버거브로스
  "lr_006": { lat: 16.0667, lng: 108.2241 }, // 반미 해피브레드
  "hi_001": { lat: 15.8771, lng: 108.3262 }, // 호이안 올드타운
  "hi_006": { lat: 15.9126, lng: 108.3448 }, // 안방비치
  "hi_010": { lat: 15.8774, lng: 108.3263 }  // 내원교
};

const CategoryButton: React.FC<{ label: string, active?: boolean, onClick: () => void }> = ({ label, active, onClick }) => {
  const getIcon = (l: string) => {
    if (l === '로컬맛집') return '🇻🇳 ';
    if (l === '관광맛집') return '⭐ ';
    if (l === '마사지') return '💆 ';
    if (l === '마트·시장') return '🛒 ';
    if (l === '카페') return '☕ ';
    return '';
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all",
        active ? "bg-teal text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200"
      )}
    >
      {getIcon(label)}{label}
    </button>
  );
};

const MOCK_LOCATIONS = [
  { name: '📍 한시장', lat: 16.0683, lng: 108.2234 },
  { name: '🌊 미케비치', lat: 16.0471, lng: 108.2479 },
  { name: '🏮 올드타운', lat: 15.8771, lng: 108.3262 },
  { name: '🏖️ 안방비치', lat: 15.9126, lng: 108.3448 }
];

const DANANG_CENTER = { lat: 16.0683, lng: 108.2234 };

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

  const activeBaseCoords = useMemo(() => {
    if (!currentCoords) return DANANG_CENTER;
    const d = calculateDistance(currentCoords.lat, currentCoords.lng, DANANG_CENTER.lat, DANANG_CENTER.lng);
    return d > 50 ? DANANG_CENTER : currentCoords;
  }, [currentCoords]);

  const loadRecommendPlaces = useCallback(async (coords: {lat: number, lng: number} | null) => {
    setLoading(true);
    try {
      const dbPlaces: PlaceData[] = [];
      const database = db as any;
      const base = coords || activeBaseCoords;

      const mapToPlaceData = (item: any, catName: string, idPrefix: string = ''): PlaceData => {
        const itemId = item.id || idPrefix;
        const manual = MANUAL_COORDS[itemId];
        
        const itemLat = item.location?.lat || manual?.lat || (item.city === 'hoian' ? 15.8801 : 16.0544);
        const itemLng = item.location?.lng || manual?.lng || (item.city === 'hoian' ? 108.3380 : 108.2022);
        
        const d = calculateDistance(base.lat, base.lng, itemLat, itemLng);
        const distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;

        let costStr = '정보없음';
        if (item.avg_cost_per_person) costStr = `${Number(item.avg_cost_per_person).toLocaleString()}동~`;
        else if (item.avg_cost) costStr = `${Number(item.avg_cost).toLocaleString()}동~`;
        else if (item.services?.[0]?.price) costStr = `${Number(item.services[0].price).toLocaleString()}동~`;
        else if (item.price_level) costStr = String(item.price_level);

        return {
          id: String(itemId || Math.random()),
          name: String(item.name_kr || item.name || '이름 없음'),
          category: catName,
          rating: Number(item.rating || item.local_rating || 0),
          distance,
          distanceVal: d,
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

      // 1. Restaurants
      if (database.restaurants) {
        if (selectedCategory === '전체' || selectedCategory === '로컬맛집') {
          database.restaurants.local?.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '로컬맛집')));
        }
        if (selectedCategory === '전체' || selectedCategory === '관광맛집') {
          database.restaurants.tourist?.forEach((r: any) => dbPlaces.push(mapToPlaceData(r, '관광맛집')));
        }
        if (selectedCategory === '전체' || selectedCategory === '카페') {
          [...(database.restaurants.local || []), ...(database.restaurants.tourist || [])].forEach((r: any) => {
            const cat = String(r.category || '');
            if (cat.includes('카페') || cat.includes('커피') || cat.includes('디저트') || cat.includes('베이커리')) {
              dbPlaces.push(mapToPlaceData(r, '카페'));
            }
          });
        }
      }

      // 2. Attractions
      if (database.attractions) {
        const allAttr = [...(database.attractions.danang || []), ...(database.attractions.hoian || [])];
        allAttr.forEach((a: any) => {
          const cat = String(a.category || '');
          if ((selectedCategory === '전체' || selectedCategory === '마트·시장') && (cat.includes('시장') || cat.includes('마트'))) {
            dbPlaces.push(mapToPlaceData(a, '마트·시장'));
          }
          if ((selectedCategory === '전체' || selectedCategory === '카페') && (cat.includes('카페') || cat.includes('커피'))) {
            dbPlaces.push(mapToPlaceData(a, '카페'));
          }
        });
      }

      // 3. Shopping (Explicit items like Han Market, Lotte Mart)
      if (database.shopping && (selectedCategory === '전체' || selectedCategory === '마트·시장')) {
        Object.entries(database.shopping).forEach(([key, s]: [string, any]) => {
           dbPlaces.push(mapToPlaceData(s, '마트·시장', key));
        });
      }

      // 4. Massage
      if (database.massage_shops && (selectedCategory === '전체' || selectedCategory === '마사지')) {
        database.massage_shops.forEach((m: any) => dbPlaces.push(mapToPlaceData(m, '마사지')));
      }

      // 5. Supabase
      try {
        const { data: userPlaces } = await supabase.from('user_places').select('*');
        if (userPlaces) {
          const mappedUserPlaces = userPlaces.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            rating: p.rating,
            distance: `${calculateDistance(base.lat, base.lng, p.location.lat, p.location.lng).toFixed(1)}km`,
            distanceVal: calculateDistance(base.lat, base.lng, p.location.lat, p.location.lng),
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
  }, [selectedCategory, activeBaseCoords]);

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
  }, [exploreMode, selectedCategory, activeBaseCoords]);

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="p-2">
        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setExploreMode('recommend')}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
              exploreMode === 'recommend' ? "bg-teal text-white shadow-sm" : "text-gray-400"
            )}
          >
            <Star className={cn("w-3 h-3", exploreMode === 'recommend' ? "fill-white" : "")} />
            추천 리스트
          </button>
          <button
            onClick={() => setExploreMode('google')}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5",
              exploreMode === 'google' ? "bg-coral text-white shadow-sm" : "text-gray-400"
            )}
          >
            <RefreshCw className="w-3 h-3" />
            구글 실시간
          </button>
        </div>
      </div>

      <div className="px-2 mb-2 flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
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
              "px-2 py-1 rounded-md text-[10px] font-bold shrink-0 border transition-all",
              currentCoords?.lat === loc.lat ? "bg-coral text-white border-coral shadow-sm" : "bg-white border-gray-200 text-gray-500"
            )}
          >
            {loc.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 px-2 pb-2 overflow-hidden">
        <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
          {(['전체', '로컬맛집', '관광맛집', '마사지', '마트·시장', '카페'] as Category[]).map(cat => (
            <CategoryButton
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-7 h-7 bg-teal text-white rounded-full flex items-center justify-center shadow active:scale-95 transition-transform"><Plus className="w-3.5 h-3.5" /></button>
      </div>

      <div className="px-2 space-y-2">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-5 h-5 animate-spin text-teal mx-auto mb-1" /><p className="text-[10px] text-gray-400">거리 계산 중...</p></div>
        ) : places.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-[10px]">정보 없음</div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="bg-white border border-gray-100 rounded-lg p-2.5 relative hover:bg-gray-50/50 transition-colors shadow-sm">
              <div className="absolute top-2.5 right-2">
                <a 
                  href={place.location ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-7 h-7 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center border border-blue-100"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </a>
              </div>
              
              <div className="pr-8">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-black text-teal bg-teal/5 px-1 py-0.5 rounded tracking-tighter">{place.category}</span>
                  {place.isUserPlace && <span className="text-[8px] font-black text-coral bg-coral/5 px-1 py-0.5 rounded tracking-tighter">MY</span>}
                  <span className="text-[9px] font-black text-teal ml-auto">{place.distance}</span>
                </div>
                
                <h4 className="text-[14px] font-black text-gray-900 leading-tight mb-0.5">{place.name}</h4>
                
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-gray-700">{place.rating}</span>
                  <span className="text-[9px] text-gray-400 ml-1.5">{place.cost}</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex gap-1 items-start">
                  <span className="text-[10px] shrink-0">👍</span>
                  <p className="text-[11px] text-gray-700 leading-snug font-medium">{place.summary.pros}</p>
                </div>
                <div className="flex gap-1 items-start">
                  <span className="text-[10px] shrink-0">⚠️</span>
                  <p className="text-[11px] text-gray-500 leading-snug font-medium">{place.summary.cons}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <AddPlaceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); refreshData(); }} />
    </div>
  );
};
