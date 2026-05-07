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

// VIETNAMESE_FOOD_DATA - 100% User Provided Data
const VIETNAMESE_FOOD_DATA = [
  {
    id: "vn_001",
    nameKr: "분보후에",
    nameVnEn: "Bún Bò Huế (Hue Beef Noodle Soup)",
    location: "", // No label for Da Nang / Hoi An
    ingredients: "소고기, 돼지고기",
    form: "쌀국수 (우동처럼 굵고 둥근 면)",
    taste: "매콤하고 진한 고기 육수, 레몬그라스 향",
    tip: "매콤한 맛을 좋아하신다면 현지 고추기름(사떼)을 살짝 풀어 드시면 국물이 훨씬 깊어집니다."
  },
  {
    id: "vn_002",
    nameKr: "퍼 보, 퍼 가",
    nameVnEn: "Phở Bò, Phở Gà (Beef or Chicken Pho)",
    location: "",
    ingredients: "소고기(보) 또는 닭고기(가)",
    form: "쌀국수 (납작한 면)",
    taste: "맑고 담백한 고기 육수",
    tip: "현지인들처럼 라임즙을 듬뿍 짜 넣고, 테이블에 있는 마늘 식초를 한 스푼 넣으면 국물 감칠맛이 확 살아납니다."
  },
  {
    id: "vn_003",
    nameKr: "반쎄오",
    nameVnEn: "Bánh Xèo (Vietnamese Sizzling Crepe)",
    location: "",
    ingredients: "돼지고기, 새우, 숙주",
    form: "쌀가루 크레이프 (부침개)",
    taste: "기름에 튀기듯 구워 고소하고 바삭함",
    tip: "라이스페이퍼에 바삭한 반쎄오와 신선한 허브를 듬뿍 넣고 돌돌 말아 소스에 푹 찍어 드세요."
  },
  {
    id: "vn_004",
    nameKr: "미꽝",
    nameVnEn: "Mì Quảng (Quang Seafood Noodle)",
    location: "",
    ingredients: "새우, 돼지고기, 메추리알, 땅콩",
    form: "쌀국수 (강황을 넣은 넓은 면)",
    taste: "간장과 피시 소스 베이스의 자작한 짭짤함",
    tip: "함께 나오는 커다랗고 바삭한 쌀과자를 부수어서 면과 비벼 먹는 것이 정석입니다."
  },
  {
    id: "vn_005",
    nameKr: "반미",
    nameVnEn: "Bánh Mì (Vietnamese Baguette Sandwich)",
    location: "",
    ingredients: "숯불 돼지고기, 파테(고기 스프레드)",
    form: "바게트 빵",
    taste: "짭짤하고 새콤달콤 (숯불향)",
    tip: "겉바속촉 바게트와 숯불 고기의 조합이 예술입니다. 고수 향을 즐기신다면 듬뿍 넣어달라고 요청해 보세요."
  },
  {
    id: "vn_006",
    nameKr: "분팃느엉",
    nameVnEn: "Bún Thịt Nướng (Grilled Pork Noodle)",
    location: "",
    ingredients: "숯불 돼지고기",
    form: "쌀국수 (얇고 차가운 면)",
    taste: "달콤짭짤한 피시 소스 베이스, 진한 숯불향",
    tip: "고기와 면, 신선한 채소를 새콤달콤한 비빔 소스에 흠뻑 적시듯 섞어 먹는 별미 국수입니다."
  },
  {
    id: "vn_007",
    nameKr: "하이산",
    nameVnEn: "Hải Sản (Seafood)",
    location: "",
    ingredients: "새우, 게, 오징어, 조개 등",
    form: "탄수화물 없음",
    taste: "선택 가능 (소금구이, 찜, 버터 갈릭 등)",
    tip: "다낭의 미케비치 근처에서는 버터 갈릭(버 또이) 소스나 매콤새콤한 타마린드 소스로 볶은 해산물이 훌륭한 안주가 됩니다."
  },
  {
    id: "vn_008",
    nameKr: "넴루이, 넴느엉",
    nameVnEn: "Nem Lụi, Nem Nướng (Grilled Pork Skewers)",
    location: "",
    ingredients: "다진 돼지고기",
    form: "꼬치 (라이스페이퍼에 싸서 먹음)",
    taste: "달짝지근한 숯불 떡갈비 맛",
    tip: "꼬치를 라이스페이퍼에 대고 쏙 빼낸 뒤, 야채와 함께 싸서 특제 땅콩 소스에 듬뿍 찍어 드세요."
  },
  {
    id: "vn_009",
    nameKr: "콤가",
    nameVnEn: "Cơm Gà (Chicken Rice)",
    location: "호이안 추천",
    ingredients: "닭고기",
    form: "쌀밥 (강황과 닭 육수로 지은 밥)",
    taste: "맵지 않고 담백, 고소함",
    tip: "짭짤한 닭고기가 듬뿍 올라간 호이안식 콤가에 테이블에 있는 칠리 소스나 간장을 살짝 비벼 드시면 일품입니다."
  },
  {
    id: "vn_010",
    nameKr: "카오러우",
    nameVnEn: "Cao Lầu (Hoi An Pork Noodle)",
    location: "호이안 전용",
    ingredients: "차슈 (간장에 졸인 돼지고기)",
    form: "쌀국수 (우동처럼 굵고 쫄깃한 호이안 특산 면)",
    taste: "간장 및 오향(다섯 가지 향신료) 베이스의 짭짤함",
    tip: "호이안에서만 맛볼 수 있는 쫄깃한 면발의 식감과 달콤짭짤한 고기 고명의 조화가 아주 좋습니다."
  },
  {
    id: "vn_011",
    nameKr: "화이트 로즈",
    nameVnEn: "Bánh Bao Bánh Vạc (White Rose Dumplings)",
    location: "호이안 전용",
    ingredients: "다진 돼지고기, 다진 새우",
    form: "쌀가루 (반투명한 만두피)",
    taste: "딤섬처럼 담백함, 튀긴 샬롯의 고소함",
    tip: "쫀득한 만두피와 새우즙의 맛을 온전히 느낀 후, 함께 나오는 새콤달콤한 느억맘 소스를 곁들여 보세요."
  },
  {
    id: "vn_012",
    nameKr: "짜오",
    nameVnEn: "Cháo (Rice Porridge)",
    location: "",
    ingredients: "닭고기, 소고기, 조개 등",
    form: "쌀죽",
    taste: "삼삼하고 부드러운 맛",
    tip: "전날 시원한 맥주를 드셨다면, 아침 일찍 여는 로컬 식당에서 따뜻하게 속을 풀기 좋은 든든한 메뉴입니다."
  },
  {
    id: "vn_013",
    nameKr: "콤 빈전",
    nameVnEn: "Cơm Bình Dân (Local Plate Lunch)",
    location: "",
    ingredients: "돼지고기, 생선 등 원하는 반찬 선택",
    form: "쌀밥과 반찬",
    taste: "반찬마다 다름 (간장 조림, 볶음 등)",
    tip: "점심시간에 갓 만들어낸 현지식 반찬들을 유리 진열장에서 가리키며 덮밥처럼 푸짐하게 즐길 수 있습니다."
  }
];

const SHOPPING_CATEGORIES = [
  { id: 'snack', name: '과자류', icon: '🍪', items: [{ name: '커피조이', desc: '얇고 바삭한 커피맛 비스킷', price: '약 15,000동' }, { name: '게리 크래커', desc: '진한 치즈맛 크래커', price: '약 25,000동' }] },
  { id: 'candy', name: '사탕·젤리', icon: '🍬', items: [{ name: '체리쉬 젤리', desc: '탱글탱글한 망고맛 젤리', price: '약 35,000동' }] }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0 overflow-hidden">
      {/* 1단: 음식 이름 (항상 노출) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between group active:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-[15px] font-black transition-colors", isOpen ? "text-mango" : "text-text-primary")}>
            {food.nameKr}
          </span>
          <span className="text-[10px] text-text-hint font-medium opacity-30">
            {food.nameVnEn}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {food.location && (
            <span className="text-[9px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">
              {food.location}
            </span>
          )}
          <ChevronRight className={cn("w-4 h-4 text-text-hint shrink-0 transition-transform duration-300", isOpen && "rotate-90 text-mango")} />
        </div>
      </button>
      
      {/* 2단: 상세 정보 (클릭 시 노출) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="pb-5 px-1 space-y-4">
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold text-mango w-12 shrink-0">주재료</span>
                  <span className="text-[12px] text-text-secondary leading-snug">{food.ingredients}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold text-mango w-12 shrink-0">형태</span>
                  <span className="text-[12px] text-text-secondary leading-snug">{food.form}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold text-mango w-12 shrink-0">맛/양념</span>
                  <span className="text-[12px] text-text-secondary leading-snug">{food.taste}</span>
                </div>
              </div>
              
              <div className="bg-white/3 rounded-xl p-3.5 border border-white/5 relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="bg-mango/20 px-1.5 py-0.5 rounded text-[9px] font-black text-mango">💡 더 맛있게 즐기는 팁</span>
                </div>
                <p className="text-[11px] text-text-primary leading-relaxed italic opacity-90">
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
      {/* 0. Vietnamese Food Encyclopedia (2-Tier Implementation) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsVnFoodOpen(!isVnFoodOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Utensils className="w-5 h-5 text-mango" /><h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isVnFoodOpen && (
          <div className="px-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {VIETNAMESE_FOOD_DATA.map((food) => (
              <FoodAccordionItem key={food.id} food={food} />
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
