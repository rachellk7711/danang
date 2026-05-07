import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight, Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// v4.0 - Meticulously Clean & Error-Free Hoi An Food Guide
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

const VIETNAMESE_FOOD_DATA = [
  {
    id: "vn_009",
    name: "Cơm Gà Hội An",
    nameKr: "콤가 (호이안 치킨 라이스)",
    label: "호이안 추천",
    desc: "강황 육수로 지은 노란 밥 위에 결대로 찢은 담백한 닭고기와 허브, 새콤한 양파 무침을 곁들인 호이안의 소울 푸드입니다.",
    tip: "호이안식 고추 소스(Chili Sauce)를 밥에 살짝 비벼 드시면 감칠맛이 훨씬 살아납니다."
  },
  {
    id: "vn_010",
    name: "Cao Lầu",
    nameKr: "카오러우 (호이안 국수)",
    label: "호이안 전용",
    desc: "호이안의 우물물로만 반죽한다는 두껍고 쫄깃한 특제 면에 짭조름한 간장 소스와 돼지고기 고명을 얹어 비벼 먹는 독특한 면 요리입니다.",
    tip: "바삭하게 튀긴 면 토핑과 신선한 야채를 한꺼번에 집어 입안 가득 식감을 느껴보세요."
  },
  {
    id: "vn_011",
    name: "Bánh Bao Bánh Vạc",
    nameKr: "화이트 로즈 (새우 만두)",
    label: "호이안 전용",
    desc: "하얀 장미 꽃잎처럼 얇고 투명한 만두피 안에 새우를 넣어 쪄낸 호이안 전통 딤섬입니다.",
    tip: "만두 위에 듬뿍 뿌려진 튀긴 마늘 후레이크와 함께 소스에 푹 찍어 드셔야 제맛입니다."
  },
  {
    id: "vn_014",
    name: "Bánh Đập",
    nameKr: "반답 (구운 라이스페이퍼)",
    label: "호이안 전용",
    desc: "바삭한 구운 라이스페이퍼와 부드러운 찐 라이스페이퍼를 겹쳐 손으로 부수어 먹는 재미있는 호이안식 간식입니다.",
    tip: "함께 제공되는 진한 조개 젓갈 소스나 헨쫀(조개 샐러드)을 곁들이면 최고의 술안주가 됩니다."
  },
  {
    id: "vn_015",
    name: "Hến Trộn",
    nameKr: "헨쫀 (조개 샐러드)",
    label: "호이안 전용",
    desc: "투본강의 작은 조개들을 야채, 땅콩과 함께 새콤달콤하게 무쳐낸 요리로, 반답과 함께 먹는 것이 정석입니다.",
    tip: "반답을 한 조각 떼어 그 위에 조개 무침을 듬뿍 올려서 드셔보세요."
  }
];

const SHOPPING_CATEGORIES = [
  {
    id: 'snack',
    name: '과자/간식',
    icon: '🍪',
    items: [
      { name: '커피조이', desc: '커피향 가득한 얇고 바삭한 비스킷', price: '약 15,000동' },
      { name: '게리 크래커', desc: '치즈가 코팅된 중독성 있는 크래커', price: '약 25,000동' },
      { name: '체리쉬 젤리', desc: '탱글탱글한 로컬 망고 젤리', price: '약 35,000동' }
    ]
  },
  {
    id: 'etc',
    name: '커피/기타',
    icon: '☕',
    items: [
      { name: 'G7 커피', desc: '베트남의 국민 인스턴트 커피', price: '약 50,000동' },
      { name: '콘삭 커피', desc: '다람쥐 캐릭터의 헤이즐넛향 필터 커피', price: '약 60,000동' }
    ]
  }
];

export const FoodShoppingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('snack');
  const [isVnFoodOpen, setIsVnFoodOpen] = useState(true);
  const [isFruitOpen, setIsFruitOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  
  // Single active state for the 2-tier food accordion
  const [activeFoodId, setActiveFoodId] = useState<string | null>(null);

  const toggleFood = (id: string) => {
    setActiveFoodId(activeFoodId === id ? null : id);
  };

  return (
    <div className="pb-16 px-4 space-y-5">
      {/* Section 0. Vietnamese Food (2-Tier Implementation) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button 
          onClick={() => setIsVnFoodOpen(!isVnFoodOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2.5">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-lg font-black text-mango tracking-tight">호이안 미식 대백과</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        
        {isVnFoodOpen && (
          <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {VIETNAMESE_FOOD_DATA.map((food) => (
              <div key={food.id} className="border-b border-white/5 last:border-0">
                {/* TIER 1: Food Name (Always Visible) */}
                <button 
                  onClick={() => toggleFood(food.id)}
                  className="w-full py-4 flex items-center justify-between group active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[15px] font-black transition-colors", activeFoodId === food.id ? "text-mango" : "text-text-primary")}>
                        {food.nameKr}
                      </span>
                      <Star className={cn("w-3 h-3 fill-mango text-mango", activeFoodId === food.id ? "opacity-100" : "opacity-0")} />
                    </div>
                    <span className="text-[9px] text-text-hint font-medium uppercase opacity-50 tracking-wider">
                      {food.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full shrink-0">
                      {food.label}
                    </span>
                    <ChevronRight className={cn("w-4 h-4 text-text-hint shrink-0 transition-transform duration-300", activeFoodId === food.id && "rotate-90 text-mango")} />
                  </div>
                </button>
                
                {/* TIER 2: Description (Expanded on click) */}
                <AnimatePresence>
                  {activeFoodId === food.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 px-1 space-y-4">
                        <div className="relative pl-3 border-l-2 border-mango/30">
                          <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
                            {food.desc}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-mango transition-all group-hover:w-full group-hover:opacity-5" />
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-mango text-navy text-[9px] font-black px-2 py-0.5 rounded uppercase">Professional Tip</div>
                          </div>
                          <p className="text-[11px] text-text-primary leading-snug italic font-semibold relative z-10">
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

      {/* Section 1. Seasonal Fruits */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button 
          onClick={() => setIsFruitOpen(!isFruitOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-teal" />
            <h2 className="text-lg font-black text-teal tracking-tight">제철 과일 가이드</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-teal transition-transform duration-300", isFruitOpen ? "rotate-90" : "rotate-0")} />
        </button>
        
        {isFruitOpen && (
          <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2 bg-navy-sub/50 p-1.5 rounded-xl border border-white/5 shadow-inner">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-text-primary focus:outline-none px-2 py-0.5"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-navy text-text-primary">{i + 1}월 방문</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-gradient-to-br from-mango/20 to-mango/5 border border-mango/20 rounded-2xl p-4 shadow-lg shadow-mango/5">
              <p className="text-[10px] text-mango font-bold mb-4 uppercase tracking-widest text-center opacity-80">지금 가장 신선한 로컬 과일</p>
              <div className="grid grid-cols-4 gap-4">
                {(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {fruit.icon}
                    </div>
                    <span className="text-[10px] font-black text-text-primary text-center leading-tight">{fruit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 2. Shopping Items */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button 
          onClick={() => setIsShoppingOpen(!isShoppingOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-coral" />
            <h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천 리스트</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-coral transition-transform duration-300", isShoppingOpen ? "rotate-90" : "rotate-0")} />
        </button>

        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
              {SHOPPING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black whitespace-nowrap transition-all border shadow-sm",
                    activeTab === cat.id 
                      ? "bg-coral text-white border-coral" 
                      : "bg-navy-sub/50 text-text-secondary border-white/5 hover:bg-white/5"
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-4 border-l-4 border-l-coral/50 hover:border-l-coral transition-all shadow-md group">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-[13px] font-black text-text-primary group-hover:text-coral transition-colors">{item.name}</h3>
                    <span className="text-[10px] text-mango font-black bg-mango/10 px-2 py-0.5 rounded-full shadow-sm">{item.price}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-normal opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodShoppingPage;
