import { useState } from 'react';
import { 
  Camera, Info, MapPin, ChevronDown, ChevronUp, Clock, 
  Waves, Palmtree, Building2, Ticket, ShoppingBag, Landmark 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DB from '../data/db.json';
import type { DBContent } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const db = DB as DBContent;

type CityType = 'danang' | 'hoian';
type CategoryFilter = '전체' | '해변' | '테마파크' | '사원·유적' | '체험' | '시장·마트';

const CATEGORY_MAP: Record<string, CategoryFilter> = {
  '해변': '해변',
  '테마파크': '테마파크',
  '워터파크': '테마파크',
  '사원': '사원·유적',
  '자연·사원': '사원·유적',
  '성당': '사원·유적',
  '유네스코 세계유산': '사원·유적',
  '유적': '사원·유적',
  '체험': '체험',
  '액티비티': '체험',
  '투어': '체험',
  '시장': '시장·마트',
  '마트': '시장·마트',
  '야시장': '시장·마트'
};

const CATEGORY_UI: Record<string, { icon: any, color: string, bg: string }> = {
  '해변': { icon: Waves, color: 'text-teal', bg: 'bg-teal/10' },
  '테마파크': { icon: Palmtree, color: 'text-mango', bg: 'bg-mango/10' },
  '사원·유적': { icon: Building2, color: 'text-mint', bg: 'bg-mint/10' },
  '체험': { icon: Ticket, color: 'text-forsythia', bg: 'bg-forsythia/10' },
  '시장·마트': { icon: ShoppingBag, color: 'text-mint', bg: 'bg-mint/10' },
  'default': { icon: Landmark, color: 'text-text-secondary', bg: 'bg-white/5' }
};

const FilterButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap border",
      active 
        ? "bg-teal text-white border-teal shadow-lg shadow-teal/20" 
        : "bg-navy-sub text-text-secondary border-white/5 hover:border-white/10"
    )}
  >
    {label}
  </button>
);

export const SpotsPage = () => {
  const [city, setCity] = useState<CityType>('danang');
  const [filter, setFilter] = useState<CategoryFilter>('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const allSpots = city === 'danang' ? db.attractions.danang : db.attractions.hoian;
  
  const filteredSpots = allSpots.filter(spot => {
    if (filter === '전체') return true;
    return CATEGORY_MAP[spot.category] === filter;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pt-28 pb-10">
      {/* 2-Line Filters */}
      <div className="px-4 mb-6 space-y-3 sticky top-24 z-20 bg-navy/80 backdrop-blur-md pb-3 border-b border-white/5">
        <div className="flex gap-2">
          {(['danang', 'hoian'] as const).map(c => (
            <button
              key={c}
              onClick={() => { setCity(c); setFilter('전체'); }}
              className={cn(
                "flex-1 py-2 text-sm font-black rounded-xl transition-all border-2",
                city === c 
                  ? "bg-teal border-teal text-white shadow-lg" 
                  : "bg-navy-sub border-white/5 text-text-secondary"
              )}
            >
              {c === 'danang' ? '다낭' : '호이안'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['전체', '해변', '테마파크', '사원·유적', '체험', '시장·마트'] as CategoryFilter[]).map(cat => (
            <FilterButton
              key={cat}
              label={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            />
          ))}
        </div>
      </div>

      {/* Spots List */}
      <div className="px-4 space-y-4">
        {filteredSpots.length === 0 ? (
          <div className="py-20 text-center text-text-hint text-sm">
            해당 카테고리의 장소가 없습니다.
          </div>
        ) : (
          filteredSpots.map((spot) => {
            const mappedCat = CATEGORY_MAP[spot.category] || 'default';
            const ui = CATEGORY_UI[mappedCat] || CATEGORY_UI.default;
            const Icon = ui.icon;

            return (
              <div 
                key={spot.id} 
                className={cn(
                  "glass-card overflow-hidden transition-all duration-300 border border-white/5",
                  expandedId === spot.id ? "ring-2 ring-teal/40 bg-navy-card" : "bg-navy-card/50"
                )}
              >
                <div 
                  onClick={() => toggleExpand(spot.id)}
                  className="p-4 cursor-pointer active:bg-white/5 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/5", ui.bg)}>
                      <Icon className={cn("w-3 h-3", ui.color)} />
                      <span className={cn("text-[10px] font-black uppercase tracking-wider", ui.color)}>
                        {spot.category}
                      </span>
                    </div>
                    <div className="mt-1">
                      {expandedId === spot.id ? (
                        <ChevronUp className="w-5 h-5 text-teal animate-bounce-subtle" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-hint" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-lg text-text-primary leading-tight mb-2 pr-6">
                    {spot.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-secondary font-bold">입장료</span>
                    <span className="text-[13px] font-black text-forsythia">
                      {spot.admission.adult === 0 ? '무료' : `${spot.admission.adult.toLocaleString()} ${spot.admission.unit}`}
                    </span>
                  </div>
                </div>
                
                {expandedId === spot.id && (
                  <div className="px-4 pb-5 space-y-4 border-t border-white/5 pt-4 bg-navy/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 text-xs text-text-primary bg-navy p-3 rounded-xl border border-white/5 shadow-inner">
                      <Clock className="w-4 h-4 text-teal" />
                      <span className="font-bold">운영시간: {spot.hours}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <Info className="w-5 h-5 text-teal shrink-0" />
                        <div>
                          <p className="text-[11px] font-black text-teal mb-1 uppercase tracking-tight">아이 동반 팁</p>
                          <p className="text-[13px] text-text-secondary leading-relaxed font-medium">{spot.kids_tip}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <Camera className="w-5 h-5 text-mango shrink-0" />
                        <div>
                          <p className="text-[11px] font-black text-mango mb-1 uppercase tracking-tight">포토스팟</p>
                          <p className="text-[13px] text-text-secondary leading-relaxed font-medium">{spot.photo_spots.join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' 베트남')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-teal hover:bg-mint text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-teal/20"
                      >
                        <MapPin className="w-4 h-4" />
                        구글 지도에서 위치 확인
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
