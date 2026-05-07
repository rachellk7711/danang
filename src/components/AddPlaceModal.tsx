import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Star, MapPin, Loader2, Save, Plus, AlertCircle, Map as MapIcon, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { UserPlace, Category } from '../types';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DANANG_CENTER = { lat: 16.0544, lng: 108.2022 };

export const AddPlaceModal = memo(({ isOpen, onClose, onSuccess }: AddPlaceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: '로컬맛집' as Category,
    good_review: '',
    bad_review: '',
    avg_cost: ''
  });

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && window.google) {
      try {
        if (!autocompleteService.current) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!placesService.current && mapRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(mapRef.current);
        }
      } catch (err) {
        console.error("Google Maps Service Init Error:", err);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (searchQuery.trim().length > 0 && autocompleteService.current) {
        setSearching(true);
        setSearchError(null);
        
        try {
          autocompleteService.current.getPlacePredictions(
            { 
              input: searchQuery,
              // More compatible biasing method
              location: new google.maps.LatLng(DANANG_CENTER.lat, DANANG_CENTER.lng),
              radius: 15000, // 15km
              componentRestrictions: { country: 'VN' }
            },
            (results, status) => {
              setSearching(false);
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setPredictions(results);
                setShowPredictions(true);
              } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                setPredictions([]);
                setSearchError('결과가 없습니다. 다낭 지역의 정확한 이름을 입력해 보세요.');
              } else {
                setPredictions([]);
                setSearchError('검색 중 오류가 발생했습니다.');
              }
            }
          );
        } catch (err) {
          setSearching(false);
          setSearchError('구글 서비스를 호출할 수 없습니다.');
        }
      } else {
        setPredictions([]);
        setShowPredictions(false);
        setSearching(false);
        setSearchError(null);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    setLoading(true);
    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ['name', 'geometry', 'formatted_address', 'rating', 'place_id'] },
      (place, status) => {
        setLoading(false);
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
          setSelectedPlace(place);
          setSearchQuery(place.name || '');
          setShowPredictions(false);
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_places')
        .insert([
          {
            name: selectedPlace.name,
            google_place_id: selectedPlace.place_id,
            category: formData.category,
            rating: selectedPlace.rating || 0,
            location: {
              lat: selectedPlace.geometry.location.lat(),
              lng: selectedPlace.geometry.location.lng()
            },
            address: selectedPlace.formatted_address,
            good_review: formData.good_review,
            bad_review: formData.bad_review,
            avg_cost: formData.avg_cost
          }
        ]);

      if (error) throw error;
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error saving place:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setSelectedPlace(null);
    setSearchQuery('');
    setFormData({
      category: '로컬맛집',
      good_review: '',
      bad_review: '',
      avg_cost: ''
    });
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-navy-sub border border-white/10 rounded-3xl w-full max-w-[400px] max-h-[90vh] overflow-visible shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div ref={mapRef} style={{ display: 'none' }} />
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-teal" />
            다낭 장소 추가
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-hint" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-6">
          <div className="space-y-2 relative">
            <label className="text-[11px] font-bold text-text-hint uppercase tracking-wider">다낭 장소 검색</label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searching ? 'text-teal animate-pulse' : 'text-text-hint'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예: 란조, 쩌비엣, 콩카페..."
                className="w-full bg-navy border border-white/5 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-teal/50"
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-teal animate-spin" />
                </div>
              )}
            </div>

            {/* Predictions List - Force to top of everything */}
            {showPredictions && predictions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[100000] mt-1 bg-navy-card border border-teal/30 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[250px] overflow-y-auto">
                {predictions.map((p) => (
                  <button
                    key={p.place_id}
                    type="button"
                    onClick={() => handleSelectPlace(p)}
                    className="w-full text-left p-4 hover:bg-teal/10 border-b border-white/5 last:border-0 transition-colors group"
                  >
                    <p className="text-sm font-bold text-white group-hover:text-teal transition-colors truncate">{p.structured_formatting.main_text}</p>
                    <p className="text-[10px] text-text-hint truncate">{p.structured_formatting.secondary_text}</p>
                  </button>
                ))}
              </div>
            )}

            {searchError && (
              <div className="flex items-center gap-2 mt-2 px-1 text-[10px] text-coral italic">
                <AlertCircle className="w-3 h-3" />
                {searchError}
              </div>
            )}
            
            {!searching && !showPredictions && searchQuery.length > 0 && !searchError && (
              <div className="flex items-center gap-2 mt-2 px-1 text-[10px] text-text-hint italic">
                <Info className="w-3 h-3" />
                목록에서 장소를 선택해 주세요.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedPlace && (
              <div className="bg-teal/10 rounded-2xl p-4 border border-teal/20 flex items-start gap-3 animate-in zoom-in-95 duration-300">
                <MapPin className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedPlace.name}</p>
                  <p className="text-[10px] text-text-hint leading-tight mt-1 line-clamp-2">{selectedPlace.formatted_address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] bg-teal/20 text-teal px-1.5 py-0.5 rounded font-bold uppercase">좌표 획득됨</span>
                    {selectedPlace.rating && (
                      <div className="flex items-center gap-0.5 text-[9px] text-forsythia font-bold">
                        <Star className="w-2.5 h-2.5 fill-forsythia" />
                        {selectedPlace.rating}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-hint uppercase tracking-wider">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full bg-navy border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal/50 appearance-none cursor-pointer"
                  >
                    <option value="로컬맛집">🇻🇳 로컬맛집</option>
                    <option value="관광맛집">⭐ 관광맛집</option>
                    <option value="마사지">💆 마사지</option>
                    <option value="카페">☕ 카페</option>
                    <option value="마트·시장">🛒 마트·시장</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-hint uppercase tracking-wider">예상 비용</label>
                  <input
                    type="text"
                    value={formData.avg_cost}
                    onChange={(e) => setFormData({ ...formData, avg_cost: e.target.value })}
                    placeholder="예: 인당 15만동"
                    className="w-full bg-navy border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-hint uppercase tracking-wider">좋은점 / 가고싶은 이유</label>
                <textarea
                  value={formData.good_review}
                  onChange={(e) => setFormData({ ...formData, good_review: e.target.value })}
                  placeholder="메모를 입력하세요..."
                  className="w-full bg-navy border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal/50 min-h-[70px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-hint uppercase tracking-wider">주의사항 / 아쉬운점</label>
                <textarea
                  value={formData.bad_review}
                  onChange={(e) => setFormData({ ...formData, bad_review: e.target.value })}
                  placeholder="메모를 입력하세요..."
                  className="w-full bg-navy border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal/50 min-h-[70px] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedPlace || !isSupabaseConfigured}
              className="w-full bg-teal text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal/30 disabled:opacity-50 transition-all active:scale-[0.95]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              다낭 위시리스트에 저장
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
