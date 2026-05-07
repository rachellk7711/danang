import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight, Info, Tag } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Seasonal Fruits Data
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

// 2. Full Vietnamese Food Data (13 Items)
const VIETNAMESE_FOOD_DATA = [
  { id: "vn_001", nameKr: "분보후에", name: "Bún Bò Huế", location: "다낭 / 호이안", ingredients: "소고기, 돼지고기", form: "쌀국수 (우동처럼 굵고 둥근 면)", taste: "매콤하고 진한 고기 육수, 레몬그라스 향", tip: "매콤한 맛을 좋아하신다면 현지 고추기름(사떼)을 살짝 풀어 드시면 국물이 훨씬 깊어집니다." },
  { id: "vn_002", nameKr: "퍼 보, 퍼 가", name: "Phở Bò, Phở Gà", location: "다낭 / 호이안", ingredients: "소고기(보) 또는 닭고기(가)", form: "쌀국수 (납작한 면)", taste: "맑고 담백한 고기 육수", tip: "라임즙을 듬뿍 짜 넣고 마늘 식초를 한 스푼 넣으면 국물 감칠맛이 확 살아납니다." },
  { id: "vn_003", nameKr: "반쎄오", name: "Bánh Xèo", location: "다낭 / 호이안", ingredients: "돼지고기, 새우, 숙주", form: "쌀가루 크레이프 (부침개)", taste: "기름에 튀기듯 구워 고소하고 바삭함", tip: "라이스페이퍼에 바삭한 반쎄오와 허브를 듬뿍 넣고 돌돌 말아 소스에 푹 찍어 드세요." },
  { id: "vn_004", nameKr: "미꽝", name: "Mì Quảng", location: "다낭 / 호이안", ingredients: "새우, 돼지고기, 메추리알, 땅콩", form: "쌀국수 (강황을 넣은 넓은 면)", taste: "간장과 피시 소스 베이스의 자작한 짭짤함", tip: "함께 나오는 바삭한 쌀과자를 부수어서 면과 비벼 먹는 것이 정석입니다." },
  { id: "vn_005", nameKr: "반미", name: "Bánh Mì", location: "다낭 / 호이안", ingredients: "숯불 돼지고기, 파테(고기 스프레드)", form: "바게트 빵", taste: "짭짤하고 새콤달콤 (숯불향)", tip: "겉바속촉 바게트와 숯불 고기의 조합이 예술입니다. 고수를 즐기신다면 듬뿍 넣어보세요." },
  { id: "vn_006", nameKr: "분팃느엉", name: "Bún Thịt Nướng", location: "다낭 / 호이안", ingredients: "숯불 돼지고기", form: "쌀국수 (얇고 차가운 면)", taste: "달콤짭짤한 피시 소스 베이스, 진한 숯불향", tip: "고기와 면, 채소를 새콤달콤한 비빔 소스에 흠뻑 적시듯 섞어 먹는 별미 국수입니다." },
  { id: "vn_007", nameKr: "하이산", name: "Hải Sản", location: "다낭 미케비치", ingredients: "새우, 게, 오징어, 조개 등", form: "탄수화물 없음", taste: "선택 가능 (소금구이, 찜, 버터 갈릭 등)", tip: "버터 갈릭 소스나 매콤새콤한 타마린드 소스로 볶은 해산물이 훌륭한 안주가 됩니다." },
  { id: "vn_008", nameKr: "넴루이, 넴느엉", name: "Nem Lụi, Nem Nướng", location: "다낭 / 호이안", ingredients: "다진 돼지고기", form: "꼬치 (라이스페이퍼에 싸서 먹음)", taste: "달짝지근한 숯불 떡갈비 맛", tip: "꼬치를 라이스페이퍼에 대고 쏙 빼낸 뒤, 야채와 함께 싸서 땅콩 소스에 찍어 드세요." },
  { id: "vn_009", nameKr: "콤가", name: "Cơm Gà", location: "호이안 추천", ingredients: "닭고기", form: "쌀밥 (강황과 닭 육수로 지은 밥)", taste: "맵지 않고 담백, 고소함", tip: "짭짤한 닭고기가 올라간 호이안식 콤가에 칠리 소스나 간장을 비벼 드시면 일품입니다." },
  { id: "vn_010", nameKr: "카오러우", name: "Cao Lầu", location: "호이안 전용", ingredients: "차슈 (돼지고기)", form: "쌀국수 (굵고 쫄깃한 호이안 특산 면)", taste: "간장 및 오향 베이스의 짭짤함", tip: "호이안에서만 맛볼 수 있는 쫄깃한 면발과 달콤짭짤한 고기 고명의 조화가 좋습니다." },
  { id: "vn_011", nameKr: "반 바오 반 박", name: "Bánh Bao Bánh Vạc", location: "호이안 전용", ingredients: "다진 돼지고기, 다진 새우", form: "쌀가루 (반투명한 만두피)", taste: "딤섬처럼 담백함, 튀긴 샬롯의 고소함", tip: "쫀득한 만두피와 새우즙을 느끼고, 새콤달콤한 느억맘 소스를 곁들여 보세요." },
  { id: "vn_012", nameKr: "짜오", name: "Cháo", location: "다낭 / 호이안", ingredients: "닭고기, 소고기, 조개 등", form: "쌀죽", taste: "삼삼하고 부드러운 맛", tip: "과음한 다음 날 아침 일찍 로컬 식당에서 따뜻하게 속을 풀기 좋은 메뉴입니다." },
  { id: "vn_013", nameKr: "콤 빈전", name: "Cơm Bình Dân", location: "다낭 / 호이안", ingredients: "돼지고기, 생선 등 반찬 선택", form: "쌀밥과 반찬", taste: "반찬마다 다름", tip: "점심시간에 갓 만든 반찬들을 가리키며 덮밥처럼 푸짐하게 즐길 수 있습니다." }
];

// 3. Full Shopping Categories (Restored All Items)
const SHOPPING_CATEGORIES = [
  {
    id: 'snack',
    name: '과자/간식',
    icon: '🍪',
    items: [
      { name: '커피조이 (Coffee Joy)', desc: '얇고 바삭한 커피맛 비스킷, 중독성 최고', price: '약 15,000동' },
      { name: '게리 치즈 크래커 (Gery)', desc: '한면에 치즈가 발린 크래커, 선물용 1위', price: '약 25,000동' },
      { name: '체리쉬 망고 젤리 (Cherish)', desc: '탱글탱글한 망고맛 젤리, 차갑게 먹으면 최고', price: '약 35,000동' },
      { name: '탑푸르트 망고젤리 (Top Fruit)', desc: '개별 포장된 쫀득한 인기 망고 젤리', price: '약 40,000동' }
    ]
  },
  {
    id: 'liquor',
    name: '주류/맥주',
    icon: '🍺',
    items: [
      { name: '라루 맥주 (Larue)', desc: '다낭의 상징, 가볍고 청량감 넘치는 로컬 맥주', price: '캔당 약 12,000동' },
      { name: '타이거 맥주 (Tiger)', desc: '베트남에서 가장 대중적인 프리미엄 라거', price: '캔당 약 18,000동' },
      { name: '넵머이 (Nep Moi)', desc: '누룽지 향이 나는 베트남 전통 보드카, 선물용 추천', price: '약 80,000동' }
    ]
  },
  {
    id: 'coffee',
    name: '커피/차',
    icon: '☕',
    items: [
      { name: '아치카페 (Archcafe)', desc: '코코넛 카푸치노가 가장 유명한 가루 커피', price: '약 60,000동' },
      { name: '미스터 비엣 (Mr. Viet)', desc: '패키지가 예뻐 선물하기 좋은 원두/가루 커피', price: '약 80,000동' },
      { name: '콘삭 커피 (Consoc)', desc: '헤이즐넛향 필터 커피 (다람쥐 똥 커피)', price: '약 70,000동' }
    ]
  },
  {
    id: 'etc',
    name: '기타 선물',
    icon: '🎁',
    items: [
      { name: '센스파 오일', desc: '천연 아로마 오일, 마사지 샵의 향기를 집으로', price: '약 150,000동' },
      { name: '라탄 가방/소품', desc: '한시장/호이안 올드타운 필수 구매 아이템', price: '10만동~' }
    ]
  }
];

// 4. Delivery Spots (Restored)
const DELIVERY_SPOTS_DANANG = [
  { category: '해산물 배달 🦀', name: '다낭 해산물 (Hải Sản)', hours: '10:00 - 22:00', contact: '카카오톡: 다낭해산물배달', desc: '미케비치 신선 해산물 배달. 버터갈릭 새우 추천.', menu: [{ name: '버터갈릭 새우 (500g)', price: '350,000₫' }] }
];
const DELIVERY_SPOTS_HOIAN = [
  { category: '반미 배달 🥖', name: '반미프엉 (Banh Mi Phuong)', hours: '06:30 - 21:30', contact: 'Grab 푸드 이용', desc: '호이안 1등 반미집.', menu: [{ name: '3번 믹스 반미', price: '35,000₫' }] }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-4 flex items-center justify-between group">
        <div className="flex items-center gap-2 text-left">
          <span className={cn("text-[15px] font-black transition-colors", isOpen ? "text-mango" : "text-text-primary")}>{food.nameKr}</span>
          <span className="text-[10px] text-text-hint font-medium uppercase opacity-30">{food.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {(food.location !== "다낭 / 호이안" && food.location !== "") && <span className="text-[9px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">{food.location}</span>}
          <ChevronRight className={cn("w-4 h-4 text-text-hint transition-transform duration-300", isOpen && "rotate-90 text-mango")} />
        </div>
      </button>
      <AnimatePresence>{isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="pb-5 px-1 space-y-3">
            <div className="grid grid-cols-1 gap-2 text-[12px] text-text-secondary">
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">주재료</span><span>{food.ingredients}</span></div>
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">형태</span><span>{food.form}</span></div>
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">맛/양념</span><span>{food.taste}</span></div>
            </div>
            <div className="bg-white/3 rounded-xl p-3 border border-white/5">
              <p className="text-[11px] text-text-primary leading-relaxed italic opacity-90">💡 {food.tip}</p>
            </div>
          </div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

const DeliveryCard: React.FC<{ spot: any }> = ({ spot }) => (
  <div className="glass-card overflow-hidden text-left">
    <div className="bg-navy-sub/50 p-3 border-b border-white/5">
      <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold text-coral uppercase">{spot.category}</span><span className="text-[10px] text-text-hint">{spot.hours}</span></div>
      <h3 className="text-sm font-black text-text-primary">{spot.name}</h3>
    </div>
    <div className="p-3 bg-white/2">
      <p className="text-[10px] text-text-secondary mb-3 italic">"{spot.desc}"</p>
      {spot.menu.map((m: any, i: number) => (
        <div key={i} className="flex justify-between items-center bg-white/3 border-l-2 border-coral/30 p-2 rounded-r-lg">
          <span className="text-[11px] text-text-primary">{m.name}</span><span className="text-[11px] font-bold text-mango">{m.price}</span>
        </div>
      ))}
    </div>
  </div>
);

export const FoodShoppingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('snack');
  const [isVnFoodOpen, setIsVnFoodOpen] = useState(true);
  const [isFruitOpen, setIsFruitOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  return (
    <div className="pb-16 px-4 space-y-5">
      {/* 5. 다낭 vs 호이안 미식 포인트 (복구) */}
      <section className="bg-navy-sub/30 rounded-2xl p-4 border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-mango" />
          <h2 className="text-lg font-black text-mango tracking-tight">다낭 vs 호이안 미식 포인트</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
            <h4 className="text-[12px] font-black text-coral mb-2">🏙️ 다낭 (Da Nang)</h4>
            <p className="text-[10px] text-text-secondary leading-relaxed">화려한 미케비치 해산물과 힙한 대형 카페들이 가득!</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
            <h4 className="text-[12px] font-black text-teal mb-2">🏮 호이안 (Hoi An)</h4>
            <p className="text-[10px] text-text-secondary leading-relaxed">올드타운의 고즈넉한 분위기와 호이안 3대 미식 투어!</p>
          </div>
        </div>
      </section>

      {/* 0. Vietnamese Food Encyclopedia */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsVnFoodOpen(!isVnFoodOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Utensils className="w-5 h-5 text-mango" /><h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isVnFoodOpen && (
          <div className="px-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {VIETNAMESE_FOOD_DATA.map((food) => (<FoodAccordionItem key={food.id} food={food} />))}
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
            <div className="flex items-center justify-end"><div className="bg-navy-sub/50 p-1.5 rounded-xl border border-white/5"><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-sm font-bold text-text-primary focus:outline-none px-2 py-0.5">{Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1} className="bg-navy text-text-primary">{i + 1}월 방문</option>))}</select></div></div>
            <div className="bg-gradient-to-br from-mango/20 to-mango/5 border border-mango/20 rounded-2xl p-4 grid grid-cols-4 gap-4">{(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (<div key={idx} className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/5">{fruit.icon}</div><span className="text-[10px] font-black text-text-primary text-center">{fruit.name}</span></div>))}</div>
          </div>
        )}
      </section>

      {/* 2. Shopping Items (Restored with Alcohol, Coffee, etc.) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsShoppingOpen(!isShoppingOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><ShoppingBag className="w-5 h-5 text-coral" /><h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천 리스트</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-coral transition-transform duration-300", isShoppingOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-1.5 mb-5">
              {SHOPPING_CATEGORIES.map((cat) => (<button key={cat.id} onClick={() => setActiveTab(cat.id)} className={cn("flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black border", activeTab === cat.id ? "bg-coral text-white border-coral shadow-md" : "bg-navy-sub/50 text-text-secondary border-white/5")}><span className="text-sm">{cat.icon}</span>{cat.name}</button>))}
            </div>
            <div className="space-y-3">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-4 border-l-4 border-l-coral/50 shadow-md text-left">
                  <div className="flex justify-between items-start mb-1.5"><h3 className="text-[13px] font-black text-text-primary">{item.name}</h3><span className="text-[10px] text-mango font-black">{item.price}</span></div>
                  <p className="text-[11px] text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Resort Delivery Section (Restored) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsDeliveryOpen(!isDeliveryOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Tag className="w-5 h-5 text-mango" /><h2 className="text-lg font-black text-mango tracking-tight">리조트 배달 맛집</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isDeliveryOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isDeliveryOpen && (
          <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-hint ml-1 uppercase tracking-widest text-left">다낭 지역 🏖️</h4>
              {DELIVERY_SPOTS_DANANG.map((spot, idx) => <DeliveryCard key={idx} spot={spot} />)}
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-hint ml-1 uppercase tracking-widest text-left">호이안 지역 🏮</h4>
              {DELIVERY_SPOTS_HOIAN.map((spot, idx) => <DeliveryCard key={idx} spot={spot} />)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodShoppingPage;
