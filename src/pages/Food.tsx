import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data for Seasonal Fruits
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
    id: "vn_001",
    name: "Bún Bò Huế",
    nameKr: "분보후에",
    location: "다낭 / 호이안",
    desc: "매콤하고 진한 소고기 육수와 굵은 면의 조화가 일품인 중부 지방 대표 국수",
    tip: "현지 고추기름(사떼)을 살짝 넣으면 국물 맛이 훨씬 깊어집니다."
  },
  {
    id: "vn_002",
    name: "Phở Bò / Gà",
    nameKr: "퍼 보 / 퍼 가",
    location: "다낭 / 호이안",
    desc: "맑고 담백한 소고기(보) 또는 닭고기(가) 육수의 베트남 국민 쌀국수",
    tip: "라임즙과 마늘 식초를 한 스푼 넣으면 국물의 풍미가 폭발합니다."
  },
  {
    id: "vn_003",
    name: "Bánh Xèo",
    nameKr: "반쎄오",
    location: "다낭 / 호이안",
    desc: "쌀가루 반죽에 돼지고기, 새우를 넣어 구운 바삭한 베트남식 부침개",
    tip: "라이스페이퍼에 허브를 듬뿍 넣고 돌돌 말아 소스에 찍어 드세요."
  },
  {
    id: "vn_004",
    name: "Mì Quảng",
    nameKr: "미꽝",
    location: "다낭 / 호이안",
    desc: "자작한 국물과 넓은 면, 땅콩과 쌀과자를 곁들인 다낭의 별미 국수",
    tip: "함께 나오는 바삭한 쌀과자를 부수어 면과 비벼 먹는 것이 정석입니다."
  },
  {
    id: "vn_005",
    name: "Bánh Mì",
    nameKr: "반미",
    location: "다낭 / 호이안",
    desc: "숯불 고기와 파테가 들어간 베트남식 바게트 샌드위치",
    tip: "고수가 싫다면 'Không cho rau thơm'을 말하세요."
  },
  {
    id: "vn_006",
    name: "Bún Thịt Nướng",
    nameKr: "분팃느엉",
    location: "다낭 / 호이안",
    desc: "숯불 돼지고기와 야채를 소스에 비벼 먹는 차가운 비빔 쌀국수",
    tip: "달콤짭짤한 피시 소스를 면 전체에 골고루 적셔 비벼 드세요."
  },
  {
    id: "vn_007",
    name: "Hải Sản",
    nameKr: "하이산",
    location: "다낭 미케비치",
    desc: "신선한 새우, 게, 오징어 등을 다양한 소스로 조리한 해산물 요리",
    tip: "버터 갈릭 소스나 타마린드 소스 볶음을 추천합니다."
  },
  {
    id: "vn_008",
    name: "Nem Lụi",
    nameKr: "넴루이",
    location: "다낭 / 호이안",
    desc: "레몬그라스 꼬치에 다진 돼지고기를 뭉쳐 구운 베트남식 떡갈비",
    tip: "라이스페이퍼에 야채와 싸서 고소한 땅콩 소스에 찍어 먹습니다."
  },
  {
    id: "vn_009",
    name: "Cơm Gà",
    nameKr: "콤가",
    location: "호이안 추천",
    desc: "강황 육수로 지은 노란 밥 위에 닭고기를 곁들인 호이안식 치킨라이스",
    tip: "호이안식 매운 고추 소스를 밥에 비벼 먹으면 더 맛있습니다."
  },
  {
    id: "vn_010",
    name: "Cao Lầu",
    nameKr: "카오러우",
    location: "호이안 전용",
    desc: "호이안의 우물물로만 만든다는 쫄깃한 특제 면의 비빔 국수",
    tip: "함께 들어있는 바삭한 튀김 과자와 면의 식감을 즐겨보세요."
  },
  {
    id: "vn_011",
    name: "Bánh Bao Bánh Vạc",
    nameKr: "화이트 로즈",
    location: "호이안 전용",
    desc: "하얀 장미 꽃잎을 닮은 호이안 전통 새우 만두",
    tip: "튀긴 마늘(샬롯)과 함께 달콤짭짤한 소스에 찍어 드세요."
  },
  {
    id: "vn_012",
    name: "Cháo",
    nameKr: "짜오",
    location: "다낭 / 호이안",
    desc: "소고기나 닭고기를 넣고 부드럽게 끓여낸 베트남식 영양 죽",
    tip: "아침 식사나 과음한 다음 날 속을 풀기 위한 메뉴로 최고입니다."
  },
  {
    id: "vn_013",
    name: "Cơm Bình Dân",
    nameKr: "콤 빈전",
    location: "다낭 / 호이안",
    desc: "원하는 반찬을 골라 밥 위에 얹어 먹는 서민 식당 (백반)",
    tip: "로컬 시장 근처에서 가장 신선하고 저렴하게 즐길 수 있습니다."
  }
];

const SHOPPING_CATEGORIES = [
  {
    id: 'snack',
    name: '과자류',
    icon: '🍪',
    items: [
      { name: '커피조이 (Coffee Joy)', desc: '얇고 바삭한 커피맛 비스킷', price: '약 15,000동' },
      { name: '게리 치즈 크래커 (Gery)', desc: '진한 치즈맛 크래커, 선물용 1위', price: '약 25,000동' },
    ]
  },
  {
    id: 'candy',
    name: '사탕·젤리',
    icon: '🍬',
    items: [
      { name: '체리쉬 망고 젤리 (Cherish)', desc: '탱글탱글한 망고맛 젤리', price: '약 35,000동' },
    ]
  }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between group active:bg-white/5 transition-colors"
      >
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2">
            <span className={cn("text-[15px] font-black transition-colors", isOpen ? "text-mango" : "text-text-primary group-hover:text-mango")}>
              {food.nameKr}
            </span>
            <span className="text-[10px] text-text-hint font-medium uppercase opacity-40">
              {food.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-coral/70 mt-0.5">
            [{food.location}]
          </span>
        </div>
        <ChevronRight className={cn("w-5 h-5 text-text-hint shrink-0 transition-transform duration-300", isOpen && "rotate-90 text-mango")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 px-1 space-y-3">
              <p className="text-[13px] text-text-secondary leading-relaxed">
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
  );
};

export const FoodShoppingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('snack');
  const [isVnFoodOpen, setIsVnFoodOpen] = useState(true);
  const [isFruitOpen, setIsFruitOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);

  return (
    <div className="pb-10 px-4 space-y-4">
      {/* 0. Vietnamese Food Section (Accordion) */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsVnFoodOpen(!isVnFoodOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        
        {isVnFoodOpen && (
          <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {VIETNAMESE_FOOD_DATA.map((food) => (
              <FoodAccordionItem key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 1. Seasonal Fruits Section */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsFruitOpen(!isFruitOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal" />
            <h2 className="text-lg font-black text-teal tracking-tight">제철 과일 가이드</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-teal transition-transform duration-300", isFruitOpen ? "rotate-90" : "rotate-0")} />
        </button>
        
        {isFruitOpen && (
          <div className="px-4 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2 bg-navy-sub/50 p-1 rounded-xl border border-white/5">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-text-primary focus:outline-none px-2 py-1"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-navy text-text-primary">{i + 1}월 방문</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-mango/10 border border-mango/20 rounded-2xl p-4">
              <p className="text-[10px] text-mango/80 font-bold mb-3 uppercase tracking-wider">추천 과일</p>
              <div className="grid grid-cols-4 gap-3">
                {(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-xl border border-white/5">
                      {fruit.icon}
                    </div>
                    <span className="text-[10px] font-bold text-text-primary">{fruit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shopping Section */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsShoppingOpen(!isShoppingOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-coral" />
            <h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천템</h2>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-coral transition-transform duration-300", isShoppingOpen ? "rotate-90" : "rotate-0")} />
        </button>

        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {SHOPPING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border",
                    activeTab === cat.id 
                      ? "bg-coral text-white border-coral" 
                      : "bg-navy-sub/50 text-text-secondary border-white/5"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-3 border-l-2 border-l-coral">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[12px] font-black text-text-primary">{item.name}</h3>
                    <span className="text-[9px] text-mango font-bold">{item.price}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary">{item.desc}</p>
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
