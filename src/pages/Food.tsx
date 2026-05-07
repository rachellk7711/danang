import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight, Tag } from 'lucide-react';
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

// Filtered Vietnamese Food Data (Hoi An Focused)
const VIETNAMESE_FOOD_DATA = [
  {
    id: "vn_009",
    name: "Cơm Gà",
    nameKr: "콤가 (호이안식 닭밥)",
    location: "호이안 추천",
    desc: "강황 육수로 지은 노란 밥 위에 잘게 찢은 닭고기와 허브를 곁들인 호이안 최고의 별미",
    tip: "호이안식 매운 고추 소스나 간장을 살짝 비벼 드시면 감칠맛이 일품입니다."
  },
  {
    id: "vn_010",
    name: "Cao Lầu",
    nameKr: "카오러우",
    location: "호이안 전용",
    desc: "오직 호이안의 우물물로만 만든다는 쫄깃한 특제 면과 돼지고기 토핑의 비빔 국수",
    tip: "함께 들어있는 바삭한 튀김 과자를 면과 함께 씹을 때의 식감을 즐겨보세요."
  },
  {
    id: "vn_011",
    name: "Bánh Bao Bánh Vạc",
    nameKr: "화이트 로즈",
    location: "호이안 전용",
    desc: "하얀 장미 꽃잎을 닮은 얇은 피 안에 새우를 넣어 쪄낸 호이안 전통 만두",
    tip: "위에 뿌려진 튀긴 마늘(샬롯)과 함께 달콤짭짤한 소스에 찍어 드세요."
  },
  {
    id: "vn_014",
    name: "Bánh Đập",
    nameKr: "반답 (라이스페이퍼 쌈)",
    location: "호이안 전용",
    desc: "바삭한 구운 라이스페이퍼와 부드러운 젖은 라이스페이퍼를 겹쳐 손으로 부수어 먹는 재미있는 음식",
    tip: "함께 나오는 진한 조개 젓갈 소스나 헨쫀(조개 샐러드)과 환상의 궁합입니다."
  },
  {
    id: "vn_015",
    name: "Hến Trộn",
    nameKr: "헨쫀 (조개 샐러드)",
    location: "호이안 전용",
    desc: "투본강에서 잡은 작은 민물 조개를 야채, 견과류와 함께 무쳐낸 새콤달콤한 샐러드",
    tip: "반답(라이스페이퍼) 위에 조개 무침을 듬뿍 올려서 바삭하게 즐겨보세요."
  }
];

const SHOPPING_CATEGORIES = [
  {
    id: 'snack',
    name: '과자류',
    icon: '🍪',
    items: [
      { name: '커피조이 (Coffee Joy)', desc: '얇고 바삭한 커피맛 비스킷, 중독성 최고', price: '약 15,000동' },
      { name: '게리 치즈 크래커 (Gery)', desc: '한면에 두꺼운 치즈가 발린 크래커, 선물용 1위', price: '약 25,000동' },
    ]
  },
  {
    id: 'candy',
    name: '사탕·젤리',
    icon: '🍬',
    items: [
      { name: '체리쉬 망고 젤리 (Cherish)', desc: '탱글탱글한 망고맛 젤리, 차갑게 먹으면 최고', price: '약 35,000동' },
      { name: '탑푸르트 망고젤리 (Top Fruit)', desc: '개별 포장된 쫀득한 식감의 인기 망고 젤리', price: '약 40,000동' },
    ]
  }
];

const DELIVERY_SPOTS_DANANG = [
  {
    category: '해산물 배달 🦀',
    name: '다낭 해산물 (Hải Sản)',
    hours: '10:00 - 22:00',
    contact: '카카오톡: 다낭해산물배달',
    desc: '미케비치 근처 신선한 해산물을 조리하여 배달합니다. 버터갈릭 새우와 칠리 크랩이 인기입니다.',
    menu: [
      { name: '버터갈릭 새우 (500g)', price: '350,000₫' },
      { name: '칠리 크랩 한 마리', price: '450,000₫' }
    ]
  }
];

const DELIVERY_SPOTS_HOIAN = [
  {
    category: '전설의 반미 🥖',
    name: '반미프엉 (Banh Mi Phuong)',
    hours: '06:30 - 21:30',
    contact: 'Grab 푸드 이용 추천',
    desc: '호이안에서 가장 유명한 반미집. 3번(믹스) 메뉴가 가장 인기 있습니다.',
    menu: [
      { name: '3번 믹스 반미', price: '35,000₫' },
      { name: '5번 바베큐 반미', price: '30,000₫' }
    ]
  }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0 overflow-hidden">
      {/* 1단: 음식 이름 (항상 노출) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3.5 flex items-center justify-between group active:bg-white/5 transition-colors"
      >
        <div className="flex items-baseline gap-2 overflow-hidden">
          <span className={cn("text-[14px] font-black transition-colors shrink-0", isOpen ? "text-mango" : "text-text-primary group-hover:text-mango")}>
            {food.nameKr}
          </span>
          <span className="text-[9px] text-text-hint font-medium uppercase truncate opacity-50">
            {food.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-coral/80 shrink-0">[{food.location}]</span>
          <ChevronRight className={cn("w-4 h-4 text-text-hint shrink-0 transition-transform duration-300", isOpen && "rotate-90 text-mango")} />
        </div>
      </button>
      
      {/* 2단: 상세 설명 (클릭 시 노출) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-0.5 space-y-2.5">
              <p className="text-[12px] text-text-secondary leading-relaxed px-1">
                {food.desc}
              </p>
              <div className="flex gap-2 items-start bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="bg-mango/20 px-1.5 py-0.5 rounded text-[9px] font-black text-mango mt-0.5">TIP</div>
                <p className="text-[11px] text-text-primary leading-snug italic">
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

const DeliveryCard: React.FC<{ spot: any }> = ({ spot }) => (
  <div className="glass-card overflow-hidden">
    <div className="bg-navy-sub/50 p-3 border-b border-white/5">
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold text-coral uppercase tracking-widest">{spot.category}</span>
        <span className="text-[10px] text-text-hint">{spot.hours}</span>
      </div>
      <h3 className="text-sm font-black text-text-primary mb-0.5">{spot.name}</h3>
      <p className="text-[10px] text-coral font-bold">{spot.contact}</p>
    </div>
    <div className="p-3 bg-white/2">
      <p className="text-[10px] text-text-secondary mb-3 leading-relaxed italic">"{spot.desc}"</p>
      <div className="space-y-1.5">
        {spot.menu.map((m: any, i: number) => (
          <div key={i} className="flex justify-between items-center bg-white/3 border-l-2 border-coral/30 p-2 rounded-r-lg">
            <span className="text-[11px] text-text-primary font-medium">{m.name}</span>
            <span className="text-[11px] font-bold text-mango bg-mango/10 px-1.5 py-0.5 rounded-md">{m.price}</span>
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

  return (
    <div className="pb-10 px-4 space-y-4">
      {/* 0. Vietnamese Food Section (2-Tier Accordion) */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsVnFoodOpen(!isVnFoodOpen)}
          className="w-full flex items-center justify-between p-3.5"
        >
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-lg font-black text-mango tracking-tight">호이안 미식 가이드</h2>
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
          className="w-full flex items-center justify-between p-3.5"
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
          className="w-full flex items-center justify-between p-3.5"
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
