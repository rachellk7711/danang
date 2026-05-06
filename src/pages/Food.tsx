import { useState } from 'react';
import { ShoppingBag, Utensils, Calendar, ChevronRight, Tag, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// Data for Shopping Items
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
      { name: '마루 초콜릿 (Marou)', desc: '베트남산 카카오로 만든 세계적인 프리미엄 초콜릿', price: '약 60,000동~' },
      { name: '코코넛 사탕', desc: '베트남 전통 방식의 쫀득한 사탕', price: '약 30,000동' },
      { name: '말린 연꽃씨 (Lotus Seed)', desc: '고소하고 건강한 영양 간식', price: '약 60,000동' },
      { name: '타마린드 젤리', desc: '새콤달콤한 태국/베트남 인기 젤리', price: '약 25,000동' },
      { name: '코코넛 크래커', desc: '바삭하게 구운 코코넛 향 가득 간식', price: '약 20,000동' },
    ]
  },
  {
    id: 'alcohol',
    name: '주류',
    icon: '🍺',
    items: [
      { name: '라루 맥주 (Larue)', desc: '탄산이 강하고 청량감이 좋아 해산물 볶음 요리와 잘 어울립니다.', price: '약 12,000동' },
      { name: '비아 사이공 (Saigon)', desc: '홉의 쌉싸름함이 느껴지는 깔끔한 라거로 반쎄오나 짜조 같은 튀김류와 찰떡궁합입니다.', price: '약 15,000동' },
      { name: '333 맥주 (Ba Ba Ba)', desc: '베트남 전통 방식의 진하고 묵직한 바디감이 특징이며, 숯불 돼지구이(분짜)와 환상적인 조화를 이룹니다.', price: '약 12,000동' },
      { name: '타이거 맥주 (Tiger)', desc: '목넘김이 부드럽고 가벼워 매콤한 쌀국수나 모닝글로리 볶음과 함께 가볍게 즐기기 좋습니다.', price: '약 18,000동' },
      { name: '넵머이 (Nep Moi)', desc: '구수한 누룽지 향이 매력적인 전통 소주로, 얼음을 넣어 독특한 풍미를 천천히 즐겨보세요.', price: '약 80,000동' },
      { name: '달랏 와인 (Dalat Wine)', desc: '달콤한 과일향이 강해 디저트나 가벼운 치즈와 어울리는 베트남 고원지대 가성비 와인.', price: '약 150,000동' },
    ]
  },
  {
    id: 'etc',
    name: '커피·기타',
    icon: '🎁',
    items: [
      { name: 'G7 커피', desc: '베트남에서 가장 유명한 인스턴트 커피. 선물용으로 최고.', price: '약 50,000동' },
      { name: '아치카페 (Archcafe)', desc: '연유커피(쓰아다) 맛이 일품인 인스턴트 커피.', price: '약 60,000동' },
      { name: '하오하오 라면 (Hao Hao)', desc: '분홍색 패키지의 새우맛 라면이 가장 인기 있습니다.', price: '약 5,000동' },
      { name: '느억맘 소스 (Fish Sauce)', desc: '베트남 요리의 핵심. 감칠맛을 내는 생선 소스.', price: '약 30,000동' },
      { name: '베트남 전통 모자 (농)', desc: '강한 햇빛을 막아주는 실용적인 기념품.', price: '약 50,000동' },
      { name: '코코넛 오일', desc: '다용도로 사용 가능한 천연 코코넛 오일.', price: '약 100,000동' },
    ]
  }
];

// Data for Delivery Recommendations
const DELIVERY_SPOTS = [
  {
    category: '과일 배달 🥭',
    name: '다낭 K-과일 (K-Fruit)',
    hours: '09:00 - 21:00',
    contact: '카카오톡 ID: kfruit_danang',
    desc: '호텔 리조트 로비까지 신선하게 깎은 과일을 아이스박스로 깔끔하게 배달해 줍니다.',
    menu: [
      { name: '손질 애플망고 1kg', price: '120,000₫' },
      { name: '망고스틴 1kg', price: '150,000₫' },
      { name: '모듬 과일팩 (대)', price: '250,000₫' }
    ]
  },
  {
    category: '해산물/회 배달 🦞',
    name: '다낭 K-씨푸드',
    hours: '11:00 - 23:00',
    contact: '카카오톡 ID: danang_seafood',
    desc: '수산시장에 직접 가지 않아도 리조트 식탁에서 신선한 회와 해산물 요리를 즐길 수 있습니다.',
    menu: [
      { name: '다금바리 회 세트', price: '850,000₫' },
      { name: '칠리 크랩 & 볶음밥', price: '450,000₫' },
      { name: '가리비 치즈구이', price: '150,000₫' }
    ]
  },
  {
    category: '한식/야식 배달 🍗',
    name: '마스터 떡볶이 & 치킨',
    hours: '16:00 - 02:00',
    contact: '카카오톡 ID: master_dn',
    desc: '현지 음식이 물릴 때 리조트 야식으로 최고입니다. 한국어로 편하게 주문 가능해요.',
    menu: [
      { name: '국물 떡볶이 세트', price: '180,000₫' },
      { name: '양념 순살 치킨', price: '220,000₫' },
      { name: '김치찌개 정식', price: '150,000₫' }
    ]
  },
  {
    category: '피자/양식 배달 🍕',
    name: "피자 4P's (Grab 배달)",
    hours: '11:00 - 22:00',
    contact: 'Grab 앱 이용',
    desc: '예약하기 힘든 다낭 최고의 피자집 메뉴를 숙소에서 그랩으로 편하게 받아볼 수 있습니다.',
    menu: [
      { name: '부라타 파마햄 피자', price: '290,000₫' },
      { name: '하프 앤 하프 피자', price: '250,000₫' },
      { name: '크랩 토마토 스파게티', price: '220,000₫' }
    ]
  },
  {
    category: '현지식 배달 🍜',
    name: '안토이 (An Thoi)',
    hours: '10:30 - 22:00',
    contact: '배달K 앱 / 그랩(Grab)',
    desc: '한국인 입맛에 가장 잘 맞는 깔끔한 현지식 식당. 에어컨 없는 식당이 싫다면 배달이 정답입니다.',
    menu: [
      { name: '소고기 쌀국수', price: '60,000₫' },
      { name: '반세오', price: '85,000₫' },
      { name: '모닝글로리 마늘볶음', price: '50,000₫' }
    ]
  }
];

export const FoodShoppingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState('snack');
  const [isFruitOpen, setIsFruitOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  const fruits = SEASONAL_FRUITS[selectedMonth] || [];

  return (
    <div className="pb-10 px-4 space-y-6">
      {/* 1. Seasonal Fruits Section */}
      <section className="bg-navy-sub/20 rounded-3xl p-1 border border-white/5">
        <button 
          onClick={() => setIsFruitOpen(!isFruitOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-xl font-black text-mango">제철 과일 가이드</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isFruitOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-mango rotate-90" />
          </div>
        </button>
        
        {isFruitOpen && (
          <div className="px-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2 bg-navy-sub/50 p-1 rounded-xl border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-text-hint ml-2" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-text-primary focus:outline-none pr-2 py-1"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-navy text-text-primary">{i + 1}월 방문</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-mango/10 border border-mango/20 rounded-2xl p-4">
              <p className="text-[11px] text-mango/80 font-bold mb-3 uppercase tracking-wider">지금 가장 맛있는 {selectedMonth}월 과일</p>
              <div className="grid grid-cols-4 gap-3">
                {fruits.map((fruit, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {fruit.icon}
                    </div>
                    <span className="text-[11px] font-black text-text-primary text-center">{fruit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shopping Items Section */}
      <section className="bg-navy-sub/20 rounded-3xl p-1 border border-white/5">
        <button 
          onClick={() => setIsShoppingOpen(!isShoppingOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal" />
            <h2 className="text-xl font-black text-teal">쇼핑 추천템</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isShoppingOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-teal rotate-90" />
          </div>
        </button>

        {isShoppingOpen && (
          <div className="px-4 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1.5 mb-6">
              {SHOPPING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all border",
                    activeTab === cat.id 
                      ? "bg-teal text-white border-teal shadow-lg shadow-teal/20" 
                      : "bg-navy-sub/50 text-text-secondary border-white/5"
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-4 flex flex-col gap-1 border-l-4 border-l-teal shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-text-primary">{item.name}</h3>
                    <span className="text-[11px] text-mango font-bold bg-mango/10 px-2 py-0.5 rounded-full">{item.price}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-tight mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Delivery Recommendations Section */}
      <section className="bg-navy-sub/20 rounded-3xl p-1 border border-white/5">
        <button 
          onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-coral" />
            <h2 className="text-xl font-black text-coral">리조트 배달 맛집</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isDeliveryOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-coral rotate-90" />
          </div>
        </button>

        {isDeliveryOpen && (
          <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {DELIVERY_SPOTS.map((spot, idx) => (
              <div key={idx} className="glass-card overflow-hidden">
                <div className="bg-navy-sub/50 p-3 border-b border-white/5 relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-coral uppercase tracking-widest">{spot.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-hint">{spot.hours}</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' 베트남')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                        title="지도 보기"
                      >
                        <MapPin className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-text-primary mb-0.5">{spot.name}</h3>
                  <p className="text-[10px] text-coral font-bold">{spot.contact}</p>
                </div>
                <div className="p-3 bg-white/2">
                  <p className="text-[10px] text-text-secondary mb-3 leading-relaxed italic">"{spot.desc}"</p>
                  <div className="space-y-1.5">
                    {spot.menu.map((m, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/3 border-l-2 border-coral/30 p-2 rounded-r-lg transition-all hover:bg-white/5 hover:border-coral group">
                        <span className="text-[11px] text-text-primary font-medium">{m.name}</span>
                        <span className="text-[11px] font-bold text-mango bg-mango/10 px-1.5 py-0.5 rounded-md">{m.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
