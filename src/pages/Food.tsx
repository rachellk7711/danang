import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Seasonal Fruits Data
const SEASONAL_FRUITS: Record<number, { name: string; icon: string }[]> = {
  1: [{ name: '용과', icon: '🐲' }, { name: '수박', icon: '🍉' }, { name: '바나나', icon: '🍌' }, { name: '오렌지', icon: '🍊' }],
  2: [{ name: '용과', icon: '🐲' }, { name: '수박', icon: '🍉' }, { name: '바나나', icon: '🍌' }, { name: '스타프루트', icon: '⭐' }],
  3: [{ name: '망고', icon: '🥭' }, { name: '스타프루트', icon: '⭐' }, { name: '용과', icon: '🐲' }, { name: '잭프루트', icon: '🍈' }],
  4: [{ name: '망고', icon: '🥭' }, { name: '망고스틴', icon: '💜' }, { name: '용과', icon: '🐲' }, { name: '스타프루트', icon: '⭐' }],
  5: [{ name: '망고', icon: '🥭' }, { name: '망고스틴', icon: '💜' }, { name: '람부탄', icon: '🔴' }, { name: '리치', icon: '🍒' }, { name: '두리안', icon: '🦨' }],
  6: [{ name: '리치', icon: '🍒' }, { name: '람부탄', icon: '🔴' }, { name: '망고스틴', icon: '💜' }, { name: '두리안', icon: '🦨' }, { name: '잭프루트', icon: '🍈' }],
  7: [{ name: '람부탄', icon: '🔴' }, { name: '망고스틴', icon: '💜' }, { name: '용안', icon: '👁️' }, { name: '패션프루트', icon: '🟣' }],
  8: [{ name: '용안', icon: '👁️' }, { name: '람부탄', icon: '🔴' }, { name: '파파야', icon: '🥭' }, { name: '구아바', icon: '🍏' }],
  9: [{ name: '포멜로', icon: '🍊' }, { name: '감', icon: '🧡' }, { name: '구아바', icon: '🍏' }, { name: '포도', icon: '🍇' }],
  10: [{ name: '포멜로', icon: '🍊' }, { name: '커스터드애플', icon: '🍏' }, { name: '감', icon: '🧡' }, { name: '용과', icon: '🐲' }],
  11: [{ name: '스타애플', icon: '🥛' }, { name: '커스터드애플', icon: '🍏' }, { name: '용과', icon: '🐲' }, { name: '바나나', icon: '🍌' }],
  12: [{ name: '스타애플', icon: '🥛' }, { name: '용과', icon: '🐲' }, { name: '수박', icon: '🍉' }, { name: '오렌지', icon: '🍊' }],
};

// Full Food Data with strict label filtering
const VIETNAMESE_FOOD_DATA = [
  { id: "vn_001", nameKr: "분보후에", name: "Bún Bò Huế", location: "다낭 / 호이안", desc: "매콤하고 진한 소고기 육수와 굵은 면의 조화가 일품인 중부 지방 대표 국수", tip: "현지 고추기름(사떼)을 살짝 넣으면 국물 맛이 훨씬 깊어집니다." },
  { id: "vn_002", nameKr: "퍼 보 / 퍼 가", name: "Phở Bò / Gà", location: "다낭 / 호이안", desc: "맑고 담백한 소고기 또는 닭고기 육수의 베트남 국민 쌀국수", tip: "라임즙과 마늘 식초를 한 스푼 넣으면 국물의 풍미가 폭발합니다." },
  { id: "vn_003", nameKr: "반쎄오", name: "Bánh Xèo", location: "다낭 / 호이안", desc: "쌀가루 반죽에 돼지고기, 새우를 넣어 구운 바삭한 베트남식 부침개", tip: "라이스페이퍼에 허브를 듬뿍 넣고 돌돌 말아 소스에 찍어 드세요." },
  { id: "vn_004", nameKr: "미꽝", name: "Mì Quảng", location: "다낭 / 호이안", desc: "자작한 국물과 넓은 면, 땅콩과 쌀과자를 곁들인 다낭의 별미 국수", tip: "쌀과자를 부수어 면과 비벼 먹는 것이 정석입니다." },
  { id: "vn_005", nameKr: "반미", name: "Bánh Mì", location: "다낭 / 호이안", desc: "숯불 고기와 파테가 들어간 베트남식 바게트 샌드위치", tip: "고수가 싫다면 'Không cho rau thơm'을 요청하세요." },
  { id: "vn_009", nameKr: "콤가", name: "Cơm Gà", location: "호이안 추천", desc: "강황 육수로 지은 노란 밥 위에 닭고기를 곁들인 호이안식 치킨라이스", tip: "호이안식 매운 고추 소스를 밥에 비벼 먹으면 더 맛있습니다." },
  { id: "vn_010", nameKr: "카오러우", name: "Cao Lầu", location: "호이안 전용", desc: "호이안의 우물물로만 만든다는 쫄깃하고 굵은 면의 특제 비빔 국수", tip: "바삭한 튀김 과자와 면의 식감을 즐겨보세요." },
  { id: "vn_011", nameKr: "화이트 로즈", name: "Bánh Bao Bánh Vạc", location: "호이안 전용", desc: "하얀 장미 꽃잎을 닮은 호이안 전통 새우 만두", tip: "튀긴 마늘(샬롯)과 함께 소스에 찍어 드세요." },
  { id: "vn_013", nameKr: "콤 빈전", name: "Cơm Bình Dân", location: "다낭 / 호이안", desc: "원하는 반찬을 골라 밥 위에 얹어 먹는 베트남식 백반", tip: "로컬 시장 근처에서 가장 신선하고 저렴하게 즐길 수 있습니다." }
];

const SHOPPING_CATEGORIES = [
  { id: 'snack', name: '과자류', icon: '🍪', items: [{ name: '커피조이', desc: '얇고 바삭한 커피맛 비스킷', price: '약 15,000동' }, { name: '게리 크래커', desc: '진한 치즈맛 크래커', price: '약 25,000동' }] },
  { id: 'candy', name: '사탕·젤리', icon: '🍬', items: [{ name: '체리쉬 젤리', desc: '탱글탱글한 망고맛 젤리', price: '약 35,000동' }] }
];

export const FoodShoppingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('snack');
  const [isVnFoodOpen, setIsVnFoodOpen] = useState(true);
  const [isFruitOpen, setIsFruitOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  
  // Track which food item is expanded
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);

  const toggleFood = (id: string) => {
    setExpandedFoodId(expandedFoodId === id ? null : id);
  };

  return (
    <div className="pb-10 px-4 space-y-4">
      {/* 0. Vietnamese Food Encyclopedia (2-Tier Accordion) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5 shadow-lg">
        <button 
          onClick={() => setIsVnFoodOpen(!isVnFoodOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2.5">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        
        {isVnFoodOpen && (
          <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {VIETNAMESE_FOOD_DATA.map((food) => (
              <div key={food.id} className="border-b border-white/5 last:border-0 overflow-hidden">
                {/* TIER 1: ONLY Food Name & Specific Labels */}
                <button 
                  onClick={() => toggleFood(food.id)}
                  className="w-full py-4 flex items-center justify-between group active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[15px] font-black transition-colors", expandedFoodId === food.id ? "text-mango" : "text-text-primary")}>
                      {food.nameKr}
                    </span>
                    <span className="text-[10px] text-text-hint font-medium uppercase opacity-30">
                      {food.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* ONLY show label if it's NOT '다낭 / 호이안' */}
                    {food.location !== "다낭 / 호이안" && (
                      <span className="text-[9px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full shrink-0">
                        {food.location}
                      </span>
                    )}
                    <ChevronRight className={cn("w-4 h-4 text-text-hint shrink-0 transition-transform duration-300", expandedFoodId === food.id && "rotate-90 text-mango")} />
                  </div>
                </button>
                
                {/* TIER 2: Description & Tip (HIDDEN by default) */}
                <AnimatePresence>
                  {expandedFoodId === food.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="pb-5 px-1 space-y-3">
                        <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
                          {food.desc}
                        </p>
                        <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="bg-mango/20 px-1.5 py-0.5 rounded text-[9px] font-black text-mango">꿀팁</span>
                          </div>
                          <p className="text-[11px] text-text-primary leading-snug italic opacity-90">
                            {food.tip}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 1. Seasonal Fruits */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsFruitOpen(!isFruitOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Calendar className="w-5 h-5 text-teal" /><h2 className="text-lg font-black text-teal tracking-tight">제철 과일 가이드</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-teal transition-transform duration-300", isFruitOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isFruitOpen && (
          <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-end"><div className="bg-navy-sub/50 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-sm font-bold text-text-primary focus:outline-none px-2 py-0.5">
                {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1} className="bg-navy text-text-primary">{i + 1}월 방문</option>))}
              </select></div></div>
            <div className="bg-gradient-to-br from-mango/20 to-mango/5 border border-mango/20 rounded-2xl p-4 shadow-lg shadow-mango/5">
              <div className="grid grid-cols-4 gap-4">{(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">{fruit.icon}</div>
                <span className="text-[10px] font-black text-text-primary text-center leading-tight">{fruit.name}</span></div>))}</div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shopping Items */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsShoppingOpen(!isShoppingOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><ShoppingBag className="w-5 h-5 text-coral" /><h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천 리스트</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-coral transition-transform duration-300", isShoppingOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
              {SHOPPING_CATEGORIES.map((cat) => (<button key={cat.id} onClick={() => setActiveTab(cat.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black whitespace-nowrap transition-all border shadow-sm", activeTab === cat.id ? "bg-coral text-white border-coral" : "bg-navy-sub/50 text-text-secondary border-white/5 hover:bg-white/5")}><span>{cat.icon}</span>{cat.name}</button>))}
            </div>
            <div className="space-y-3">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (<div key={idx} className="glass-card p-4 border-l-4 border-l-coral/50 hover:border-l-coral transition-all shadow-md group">
                <div className="flex justify-between items-start mb-1.5"><h3 className="text-[13px] font-black text-text-primary group-hover:text-coral transition-colors">{item.name}</h3><span className="text-[10px] text-mango font-black bg-mango/10 px-2 py-0.5 rounded-full shadow-sm">{item.price}</span></div><p className="text-[11px] text-text-secondary leading-normal opacity-80">{item.desc}</p></div>))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodShoppingPage;
