import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight, Tag, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Seasonal Fruits Data (Full)
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
  { name: "Bún Bò Huế", nameKr: "분보후에", location: "다낭 / 호이안", ingredients: "소고기, 돼지고기", form: "쌀국수 (우동처럼 굵고 둥근 면)", taste: "매콤하고 진한 고기 육수, 레몬그라스 향", tip: "매콤한 맛을 좋아하신다면 현지 고추기름(사떼)을 살짝 풀어 드시면 국물이 훨씬 깊어집니다." },
  { name: "Phở Bò / Gà", nameKr: "퍼 보 / 퍼 가", location: "다낭 / 호이안", ingredients: "소고기(보) 또는 닭고기(가)", form: "쌀국수 (납작한 면)", taste: "맑고 담백한 고기 육수", tip: "라임즙을 듬뿍 짜 넣고, 마늘 식초를 한 스푼 넣으면 국물 감칠맛이 확 살아납니다." },
  { name: "Bánh Xèo", nameKr: "반쎄오", location: "다낭 / 호이안", ingredients: "돼지고기, 새우, 숙주", form: "쌀가루 크레이프 (부침개)", taste: "기름에 튀기듯 구워 고소하고 바삭함", tip: "라이스페이퍼에 허브를 듬뿍 넣고 돌돌 말아 소스에 푹 찍어 드세요." },
  { name: "Mì Quảng", nameKr: "미꽝", location: "다낭 / 호이안", ingredients: "새우, 돼지고기, 메추리알, 땅콩", form: "쌀국수 (강황을 넣은 넓은 면)", taste: "간장과 피시 소스 베이스의 자작한 짭짤함", tip: "함께 나오는 바삭한 쌀과자를 부수어서 면과 비벼 먹는 것이 정석입니다." },
  { name: "Bánh Mì", nameKr: "반미", location: "다낭 / 호이안", ingredients: "숯불 돼지고기, 파테(고기 스프레드)", form: "바게트 빵", taste: "짭짤하고 새콤달콤 (숯불향)", tip: "겉바속촉 바게트와 숯불 고기의 조합이 예술입니다." },
  { name: "Bún Thịt Nướng", nameKr: "분팃느엉", location: "다낭 / 호이안", ingredients: "숯불 돼지고기", form: "쌀국수 (얇고 차가운 면)", taste: "달콤짭짤한 피시 소스 베이스, 진한 숯불향", tip: "고기와 면, 채소를 비빔 소스에 흠뻑 적시듯 섞어 먹는 별미입니다." },
  { name: "Hải Sản", nameKr: "하이산", location: "다낭 (미케비치 추천)", ingredients: "새우, 게, 오징어, 조개 등", form: "해산물 요리", taste: "선택 가능 (버터 갈릭, 칠리 등)", tip: "버터 갈릭(버 또이) 소스나 타마린드 소스 볶음을 추천합니다." },
  { name: "Nem Lụi", nameKr: "넴루이", location: "다낭 / 호이안", ingredients: "다진 돼지고기", form: "꼬치 요리", taste: "달짝지근한 숯불 떡갈비 맛", tip: "라이스페이퍼에 야채와 함께 싸서 땅콩 소스에 찍어 드세요." },
  { name: "Cơm Gà", nameKr: "콤가", location: "호이안 추천", ingredients: "닭고기", form: "쌀밥 (강황과 닭 육수 밥)", taste: "맵지 않고 담백 고소함", tip: "호이안식 콤가에 칠리 소스나 간장을 살짝 비벼 드시면 일품입니다." },
  { name: "Cao Lầu", nameKr: "카오러우", location: "호이안 전용", ingredients: "차슈 (돼지고기)", form: "쌀국수 (쫄깃한 특산 면)", taste: "간장 및 오향 베이스 짭짤함", tip: "호이안에서만 맛볼 수 있는 독특한 면발의 식감이 아주 좋습니다." },
  { name: "Bánh Bao Bánh Vạc", nameKr: "반 바오 반 박 (화이트 로즈)", location: "호이안 전용", ingredients: "다진 돼지고기, 새우", form: "쌀가루 (반투명 만두피)", taste: "딤섬처럼 담백, 샬롯 고소함", tip: "쫀득한 만두피와 새우즙의 맛을 느낀 후 느억맘 소스를 곁들여 보세요." },
  { name: "Cháo", nameKr: "짜오 (쌀죽)", location: "다낭 / 호이안", ingredients: "닭고기, 소고기 등", form: "쌀죽", taste: "삼삼하고 부드러운 맛", tip: "아침 일찍 로컬 식당에서 따뜻하게 속을 풀기 좋은 메뉴입니다." },
  { name: "Cơm Bình Dân", nameKr: "콤 빈전 (로컬 백반)", location: "다낭 / 호이안", ingredients: "돼지고기, 생선 등", form: "쌀밥과 반찬", taste: "반찬마다 다름", tip: "원하는 반찬을 가리키며 덮밥처럼 푸짐하게 즐길 수 있습니다." }
];

// 3. Full Shopping Categories (Detailed)
const SHOPPING_CATEGORIES = [
  {
    id: 'snack',
    name: '과자류',
    icon: '🍪',
    items: [
      { name: '커피조이 (Coffee Joy)', desc: '얇고 바삭한 커피맛 비스킷, 중독성 최고', price: '약 15,000동' },
      { name: '게리 치즈 크래커 (Gery)', desc: '한면에 두꺼운 치즈가 발린 크래커, 선물용 1위', price: '약 25,000동' },
      { name: '비나밋 과일칩 (Vinamit)', desc: '믹스 과일 건조칩, 건강한 로컬 간식', price: '약 45,000동' },
      { name: '아 치즈 과자 (Ahh)', desc: '진한 치즈 시즈닝의 옥수수 스틱', price: '약 20,000동' },
      { name: '오이시 필로우 (Oishi Pillows)', desc: '초코/치즈 필링이 들어간 바삭한 과자', price: '약 10,000동' },
      { name: '칼치즈 (Calcheese)', desc: '치즈 웨하스, 아이들이 좋아함', price: '약 15,000동' },
    ]
  },
  {
    id: 'candy',
    name: '사탕·젤리',
    icon: '🍬',
    items: [
      { name: '체리쉬 망고 젤리 (Cherish)', desc: '탱글탱글한 망고맛 젤리, 차갑게 먹으면 최고', price: '약 35,000동' },
      { name: '탑푸르트 망고젤리 (Top Fruit)', desc: '개별 포장된 쫀득한 식감의 인기 망고 젤리', price: '약 40,000동' },
      { name: '마루 초콜릿 (Marou)', desc: '베트남산 카카오 프리미엄 초콜릿', price: '약 60,000동~' },
      { name: '코코넛 사탕', desc: '베트남 전통 방식의 쫀득한 사탕', price: '약 30,000동' },
      { name: '말린 연꽃씨 (Lotus Seed)', desc: '고소하고 건강한 영양 간식', price: '약 60,000동' },
      { name: '타마린드 젤리', desc: '새콤달콤한 인기 젤리', price: '약 25,000동' },
      { name: '코코넛 크래커', desc: '바삭하게 구운 코코넛 향 가득 간식', price: '약 20,000동' },
    ]
  },
  {
    id: 'alcohol',
    name: '주류',
    icon: '🍺',
    items: [
      { name: '라루 맥주 (Larue)', desc: '탄산이 강하고 청량감이 좋아 해산물 요리와 잘 어울립니다.', price: '약 12,000동' },
      { name: '비아 사이공 (Saigon)', desc: '쌉싸름하고 깔끔한 라거, 튀김류와 찰떡궁합입니다.', price: '약 15,000동' },
      { name: '333 맥주 (Ba Ba Ba)', desc: '전통 방식의 진하고 묵직한 바디감이 특징입니다.', price: '약 12,000동' },
      { name: '타이거 맥주 (Tiger)', desc: '목넘김이 부드럽고 가벼워 누구나 즐기기 좋습니다.', price: '약 18,000동' },
      { name: '넵머이 (Nep Moi)', desc: '구수한 누룽지 향이 매력적인 전통 소주입니다.', price: '약 80,000동' },
      { name: '달랏 와인 (Dalat Wine)', desc: '달콤한 과일향이 강한 가성비 와인.', price: '약 150,000동' },
    ]
  },
  {
    id: 'etc',
    name: '커피·기타',
    icon: '🎁',
    items: [
      { name: 'G7 커피', desc: '베트남에서 가장 유명한 인스턴트 커피.', price: '약 50,000동' },
      { name: '아치카페 (Archcafe)', desc: '코코넛 커피 맛이 일품인 인스턴트 커피.', price: '약 60,000동' },
      { name: '콘삭 커피 (Consoc)', desc: '헤이즐넛 향의 다람쥐 똥 커피(필터형).', price: '약 70,000동' },
      { name: '하오하오 라면 (Hao Hao)', desc: '분홍색 패키지의 새우맛 라면이 인기입니다.', price: '약 5,000동' },
      { name: '느억맘 소스 (Fish Sauce)', desc: '베트남 요리의 핵심 감칠맛 소스.', price: '약 30,000동' },
      { name: '전통 모자 (농)', desc: '강한 햇빛을 막아주는 실용적인 기념품.', price: '약 50,000동' },
    ]
  }
];

// 4. Full Delivery Spots (Restored)
const DELIVERY_SPOTS_DANANG = [
  { category: '생과일 배달 🥭', name: '유가네 과일 (Yu Ga Ne)', hours: '10:00 - 22:00', contact: '카톡: 유가네 과일', desc: '다낭에서 가장 유명한 과일 배달. 먹기 좋게 손질된 애플망고 추천.', menu: [{ name: '손질 애플망고 (특)', price: '130,000₫' }, { name: '망고스틴 1kg', price: '160,000₫' }] },
  { category: '프리미엄 BBQ 🥩', name: '골든미트 (Golden Meat)', hours: '11:00 - 22:30', contact: '카톡: 골든미트', desc: '와규와 이베리코 돼지고기를 완벽하게 구워서 배달해 줍니다.', menu: [{ name: '이베리코 꽃목살', price: '320,000₫' }, { name: '김치볶음밥', price: '120,000₫' }] },
  { category: '현지식 맛집 🍜', name: '안토이 (An Thoi)', hours: '10:30 - 22:00', contact: '카톡: 다낭안토이', desc: '줄 서서 먹는 다낭 대표 맛집. 매장 맛 그대로 깔끔하게 포장됩니다.', menu: [{ name: '반세오 (최고 인기)', price: '89,000₫' }, { name: '소고기 쌀국수', price: '65,000₫' }] },
  { category: '해산물 배달 🦞', name: '목 해산물 식당 (Moc Quan)', hours: '10:30 - 23:00', contact: '카톡: 다낭 목 해산물 식당', desc: '가성비 최고의 해산물 식당. 크랩, 새우 요리 강력 추천.', menu: [{ name: '블랙타이거 새우 (칠리)', price: '250,000₫~' }, { name: '맛조개 모닝글로리', price: '95,000₫' }] }
];

const DELIVERY_SPOTS_HOIAN = [
  { category: '로컬 맛집 🍜', name: '호로콴 (Ho Lo Quan)', hours: '11:30 - 21:00', contact: ' Grab 푸드 이용', desc: '호이안 3대 미식을 한 번에 즐길 수 있는 로컬 맛집.', menu: [{ name: '타마린드 새우', price: '145,000₫' }, { name: '화이트 로즈', price: '75,000₫' }] },
  { category: '반미 명가 🥖', name: '반미프엉 (Banh Mi Phuong)', hours: '06:30 - 21:30', contact: 'Grab 푸드 / 직접 방문', desc: '호이안 1등 반미집. 세계적인 유명세만큼 맛도 보장됩니다.', menu: [{ name: '3번 믹스 반미', price: '35,000₫' }, { name: '소고기 반미', price: '40,000₫' }] },
  { category: '수제 버거 🍔', name: '버거크래프트 (Burger Craft)', hours: '11:00 - 22:00', contact: 'Grab 푸드 이용', desc: '베트남 음식이 지겨울 때 추천하는 고퀄리티 수제버거.', menu: [{ name: '시그니처 비프버거', price: '165,000₫' }] }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-4 flex items-center justify-between group active:bg-white/5 transition-colors text-left">
        <div className="flex items-center gap-2">
          <span className={cn("text-[15px] font-black transition-colors", isOpen ? "text-mango" : "text-text-primary")}>{food.nameKr}</span>
          <span className="text-[10px] text-text-hint font-medium uppercase opacity-30">{food.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {(food.location !== "다낭 / 호이안") && <span className="text-[9px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">{food.location}</span>}
          <ChevronRight className={cn("w-4 h-4 text-text-hint transition-transform duration-300", isOpen && "rotate-90 text-mango")} />
        </div>
      </button>
      <AnimatePresence>{isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="pb-5 px-1 space-y-3">
            <div className="grid grid-cols-1 gap-2 text-[12px] text-text-secondary">
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">주재료</span><span>{food.ingredients}</span></div>
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">형태</span><span>{food.form}</span></div>
              <div className="flex gap-2"><span className="text-mango font-bold w-12 shrink-0">주요맛</span><span>{food.taste}</span></div>
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
  <div className="glass-card overflow-hidden text-left shadow-lg">
    <div className="bg-navy-sub/50 p-3.5 border-b border-white/5">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[10px] font-bold text-coral uppercase tracking-widest">{spot.category}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-hint">{spot.hours}</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' 베트남')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"><MapPin className="w-3 h-3" /></a>
        </div>
      </div>
      <h3 className="text-sm font-black text-text-primary mb-0.5">{spot.name}</h3>
      <p className="text-[10px] text-coral font-bold">{spot.contact}</p>
    </div>
    <div className="p-3.5 bg-white/2">
      <p className="text-[10px] text-text-secondary mb-4 leading-relaxed italic opacity-80">"{spot.desc}"</p>
      <div className="space-y-2">
        {spot.menu.map((m: any, i: number) => (
          <div key={i} className="flex justify-between items-center bg-white/3 border-l-2 border-coral/30 p-2.5 rounded-r-lg transition-all hover:bg-white/5">
            <span className="text-[11px] text-text-primary font-medium">{m.name}</span>
            <span className="text-[11px] font-bold text-mango bg-mango/10 px-2 py-0.5 rounded-md">{m.price}</span>
          </div>
        ))}
      </div>
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
  const [isHoianDeliveryOpen, setIsHoianDeliveryOpen] = useState(false);

  return (
    <div className="pb-16 px-4 space-y-5">
      {/* 0. Vietnamese Food Encyclopedia */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsVnFoodOpen(!isVnFoodOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Utensils className="w-5 h-5 text-mango" /><h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isVnFoodOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isVnFoodOpen && (
          <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 divide-y divide-white/5">
            {VIETNAMESE_FOOD_DATA.map((food, idx) => (<FoodAccordionItem key={idx} food={food} />))}
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
            <div className="bg-mango/10 border border-mango/20 rounded-2xl p-4 grid grid-cols-4 gap-4">{(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (<div key={idx} className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">{fruit.icon}</div><span className="text-[10px] font-black text-text-primary text-center leading-tight">{fruit.name}</span></div>))}</div>
          </div>
        )}
      </section>

      {/* 2. Shopping Items (Full) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5 text-left">
        <button onClick={() => setIsShoppingOpen(!isShoppingOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><ShoppingBag className="w-5 h-5 text-coral" /><h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천 리스트</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-coral transition-transform duration-300", isShoppingOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-1.5 mb-5">
              {SHOPPING_CATEGORIES.map((cat) => (<button key={cat.id} onClick={() => setActiveTab(cat.id)} className={cn("flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black border transition-all", activeTab === cat.id ? "bg-coral text-white border-coral shadow-md" : "bg-navy-sub/50 text-text-secondary border-white/5")}><span className="text-sm">{cat.icon}</span>{cat.name}</button>))}
            </div>
            <div className="space-y-3">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-4 border-l-4 border-l-coral/50 shadow-md">
                  <div className="flex justify-between items-start mb-1.5"><h3 className="text-[13px] font-black text-text-primary">{item.name}</h3><span className="text-[10px] text-mango font-bold">{item.price}</span></div>
                  <p className="text-[11px] text-text-secondary leading-normal opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Delivery Recommendations (Da Nang) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsDeliveryOpen(!isDeliveryOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Tag className="w-5 h-5 text-mango" /><h2 className="text-lg font-black text-mango tracking-tight">다낭 배달 맛집</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-mango transition-transform duration-300", isDeliveryOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isDeliveryOpen && (
          <div className="px-4 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {DELIVERY_SPOTS_DANANG.map((spot, idx) => (<DeliveryCard key={idx} spot={spot} />))}
          </div>
        )}
      </section>

      {/* 4. Delivery Recommendations (Hoi An) */}
      <section className="bg-navy-sub/20 rounded-2xl p-1 border border-white/5">
        <button onClick={() => setIsHoianDeliveryOpen(!isHoianDeliveryOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5"><Tag className="w-5 h-5 text-teal" /><h2 className="text-lg font-black text-teal tracking-tight">호이안 배달 맛집</h2></div>
          <ChevronRight className={cn("w-5 h-5 text-teal transition-transform duration-300", isHoianDeliveryOpen ? "rotate-90" : "rotate-0")} />
        </button>
        {isHoianDeliveryOpen && (
          <div className="px-4 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {DELIVERY_SPOTS_HOIAN.map((spot, idx) => (<DeliveryCard key={idx} spot={spot} />))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodShoppingPage;
