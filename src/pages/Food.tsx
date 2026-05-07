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

const VIETNAMESE_FOOD_DATA = [
  {
    name: "Bún Bò Huế",
    nameKr: "분보후에",
    location: "다낭 / 호이안",
    ingredients: "소고기, 돼지고기",
    form: "쌀국수 (우동처럼 굵고 둥근 면)",
    taste: "매콤하고 진한 고기 육수, 레몬그라스 향",
    tip: "매콤한 맛을 좋아하신다면 현지 고추기름(사떼)을 살짝 풀어 드시면 국물이 훨씬 깊어집니다."
  },
  {
    name: "Phở Bò / Gà",
    nameKr: "퍼 보 / 퍼 가",
    location: "다낭 / 호이안",
    ingredients: "소고기(보) 또는 닭고기(가)",
    form: "쌀국수 (납작한 면)",
    taste: "맑고 담백한 고기 육수",
    tip: "라임즙을 듬뿍 짜 넣고, 마늘 식초를 한 스푼 넣으면 국물 감칠맛이 확 살아납니다."
  },
  {
    name: "Bánh Xèo",
    nameKr: "반쎄오",
    location: "다낭 / 호이안",
    ingredients: "돼지고기, 새우, 숙주",
    form: "쌀가루 크레이프 (부침개)",
    taste: "기름에 튀기듯 구워 고소하고 바삭함",
    tip: "라이스페이퍼에 허브를 듬뿍 넣고 돌돌 말아 소스에 푹 찍어 드세요."
  },
  {
    name: "Mì Quảng",
    nameKr: "미꽝",
    location: "다낭 / 호이안",
    ingredients: "새우, 돼지고기, 메추리알, 땅콩",
    form: "쌀국수 (강황을 넣은 넓은 면)",
    taste: "간장과 피시 소스 베이스의 자작한 짭짤함",
    tip: "함께 나오는 바삭한 쌀과자를 부수어서 면과 비벼 먹는 것이 정석입니다."
  },
  {
    name: "Bánh Mì",
    nameKr: "반미",
    location: "다낭 / 호이안",
    ingredients: "숯불 돼지고기, 파테(고기 스프레드)",
    form: "바게트 빵",
    taste: "짭짤하고 새콤달콤 (숯불향)",
    tip: "겉바속촉 바게트와 숯불 고기의 조합이 예술입니다."
  },
  {
    name: "Bún Thịt Nướng",
    nameKr: "분팃느엉",
    location: "다낭 / 호이안",
    ingredients: "숯불 돼지고기",
    form: "쌀국수 (얇고 차가운 면)",
    taste: "달콤짭짤한 피시 소스 베이스, 진한 숯불향",
    tip: "고기와 면, 채소를 비빔 소스에 흠뻑 적시듯 섞어 먹는 별미입니다."
  },
  {
    name: "Hải Sản",
    nameKr: "하이산",
    location: "다낭 (미케비치 추천)",
    ingredients: "새우, 게, 오징어, 조개 등",
    form: "해산물 요리",
    taste: "선택 가능 (버터 갈릭, 칠리 등)",
    tip: "버터 갈릭(버 또이) 소스나 타마린드 소스 볶음을 추천합니다."
  },
  {
    name: "Nem Lụi",
    nameKr: "넴루이",
    location: "다낭 / 호이안",
    ingredients: "다진 돼지고기",
    form: "꼬치 요리",
    taste: "달짝지근한 숯불 떡갈비 맛",
    tip: "라이스페이퍼에 야채와 함께 싸서 땅콩 소스에 찍어 드세요."
  },
  {
    name: "Cơm Gà",
    nameKr: "콤가",
    location: "다낭 / 호이안 (호이안 추천)",
    ingredients: "닭고기",
    form: "쌀밥 (강황 육수 밥)",
    taste: "맵지 않고 담백, 고소함",
    tip: "호이안식 콤가에 칠리 소스나 간장을 살짝 비벼 드시면 일품입니다."
  },
  {
    name: "Cao Lầu",
    nameKr: "카오러우",
    location: "호이안 전용",
    ingredients: "차슈 (졸인 돼지고기)",
    form: "쌀국수 (굵고 쫄깃한 특산 면)",
    taste: "간장 베이스의 짭짤한 맛",
    tip: "호이안에서만 맛볼 수 있는 쫄깃한 면발의 식감을 즐겨보세요."
  },
  {
    name: "Bánh Bao Bánh Vạc",
    nameKr: "화이트 로즈",
    location: "호이안 전용",
    ingredients: "돼지고기, 새우",
    form: "쌀가루 만두",
    taste: "딤섬처럼 담백하고 쫀득함",
    tip: "만두피의 쫀득함과 새우즙의 맛을 느낀 후 소스를 곁들여 보세요."
  },
  {
    name: "Cháo",
    nameKr: "짜오",
    location: "다낭 / 호이안",
    ingredients: "닭고기, 소고기 등",
    form: "쌀죽",
    taste: "삼삼하고 부드러운 맛",
    tip: "과음한 다음 날 아침 일찍 속을 풀기 좋은 메뉴입니다."
  },
  {
    name: "Cơm Bình Dân",
    nameKr: "콤 빈전",
    location: "다낭 / 호이안",
    ingredients: "돼지고기, 생선 등 선택 반찬",
    form: "로컬 덮밥",
    taste: "반찬에 따라 다양함",
    tip: "점심시간에 갓 만든 반찬을 가리켜서 푸짐하게 즐겨보세요."
  }
];

const FoodAccordionItem: React.FC<{ food: any }> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 flex items-center justify-between group"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-black text-text-primary group-hover:text-mango transition-colors">{food.nameKr}</span>
          <span className="text-[9px] text-text-hint font-medium uppercase">{food.name}</span>
          <span className="text-[9px] font-bold text-coral/80 ml-1">{food.location}</span>
        </div>
        <ChevronRight className={cn("w-3.5 h-3.5 text-text-hint transition-transform duration-200", isOpen && "rotate-90 text-mango")} />
      </button>
      
      {isOpen && (
        <div className="pb-3 px-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-mango shrink-0">재료/형태:</span>
              <span className="text-[10px] text-text-secondary leading-tight">{food.ingredients} / {food.form}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-mango shrink-0">주요맛:</span>
              <span className="text-[10px] text-text-secondary leading-tight">{food.taste}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <p className="text-[10px] text-text-primary leading-relaxed">
              <span className="text-mango font-bold mr-1">💡 Tip</span>
              {food.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
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

// Data for Delivery Recommendations (Verified for 2024-2025)
const DELIVERY_SPOTS_DANANG = [
  {
    category: '생과일 배달 🥭',
    name: '유가네 과일 (Yu Ga Ne)',
    hours: '10:00 - 22:00',
    contact: '카카오톡 채널: 유가네 과일',
    desc: '다낭에서 가장 유명한 과일 배달 업체. 먹기 좋게 손질된 애플망고와 망고스틴을 리조트 로비에서 편하게 받을 수 있습니다.',
    menu: [
      { name: '손질 애플망고 (특)', price: '130,000₫' },
      { name: '망고스틴 1kg (제철)', price: '160,000₫' },
      { name: '프리미엄 모듬 과일세트', price: '280,000₫' }
    ]
  },
  {
    category: '프리미엄 BBQ 🥩',
    name: '골든미트 (Golden Meat)',
    hours: '11:00 - 22:30',
    contact: '카카오톡 채널: 골든미트',
    desc: '고퀄리티 와규와 이베리코 돼지고기를 완벽하게 구워서 리조트로 배달해 줍니다. 든든한 고기 한 끼가 생각날 때 최고입니다.',
    menu: [
      { name: '와규 립아이 세트', price: '950,000₫' },
      { name: '이베리코 꽃목살 (구이)', price: '320,000₫' },
      { name: '김치볶음밥 / 된장찌개', price: '120,000₫' }
    ]
  },
  {
    category: '현지식 맛집 배달 🍜',
    name: '안토이 (An Thoi)',
    hours: '10:30 - 22:00',
    contact: '카카오톡 채널: 다낭안토이',
    desc: '줄 서서 먹는 다낭 대표 맛집. 한국어 주문이 가능하며 리조트 배달 시에도 매장 맛 그대로 깔끔하게 포장되어 옵니다.',
    menu: [
      { name: '반세오 (최고 인기)', price: '89,000₫' },
      { name: '소고기 쌀국수', price: '65,000₫' },
      { name: '파인애플 볶음밥', price: '115,000₫' }
    ]
  },
  {
    category: '해산물 전문 배달 🦞',
    name: '목 해산물 식당 (Moc Quan)',
    hours: '10:30 - 23:00',
    contact: '카카오톡 채널: 다낭 목 해산물 식당',
    desc: '미케비치 근처 가성비 최고의 해산물 식당. 크랩, 새우 요리를 매장에 가지 않고 리조트 식탁에서 즐길 수 있습니다.',
    menu: [
      { name: '블랙타이거 새우 (크림/칠리)', price: '250,000₫~' },
      { name: '해산물 볶음면', price: '120,000₫' },
      { name: '맛조개 모닝글로리 볶음', price: '95,000₫' }
    ]
  },
  {
    category: '베트남 3대 쌀국수 🍜',
    name: '포틴 다낭 (Pho Thin)',
    hours: '06:00 - 22:00',
    contact: '배달K / Grab 이용',
    desc: '하노이에서 온 전설적인 쌀국수. 진한 고기 육수가 특징이며, 현지인과 관광객 모두에게 사랑받는 곳입니다.',
    menu: [
      { name: '직화 소고기 쌀국수', price: '65,000₫' },
      { name: '포틴 콤보 (쌀국수+꿔이)', price: '85,000₫' },
      { name: '파 많이 쌀국수 (전통)', price: '65,000₫' }
    ]
  },
  {
    category: '프리미엄 크랩 🦀',
    name: '레드크랩 (Red Crab)',
    hours: '10:00 - 22:00',
    contact: '카카오톡: 다낭레드크랩',
    desc: '고급스러운 필리핀 스타일 알리망오 크랩 요리 전문점. 특별한 날 리조트에서 파티 분위기 내기에 좋습니다.',
    menu: [
      { name: '블랙페퍼 크랩', price: '변동' },
      { name: '갈릭 버터 새우', price: '320,000₫' },
      { name: '상하이 볶음밥', price: '120,000₫' }
    ]
  },
  {
    category: '야식 치킨/분식 배달 🍗',
    name: '다낭 치킨톡 (Chicken Talk)',
    hours: '15:00 - 01:00',
    contact: '카카오톡 ID: dnck',
    desc: '리조트 야식이 고민될 때 1순위. 한국식 바삭한 치킨과 떡볶이 등 분식 메뉴를 늦은 밤까지 배달해 줍니다.',
    menu: [
      { name: '반반 치킨 (후라이드/양념)', price: '320,000₫' },
      { name: '국물 떡볶이 & 튀김 세트', price: '250,000₫' },
      { name: '골뱅이 소면', price: '280,000₫' }
    ]
  }
];

const DELIVERY_SPOTS_HOIAN = [
  {
    category: '호이안 로컬 맛집 1위 🍜',
    name: '호로콴 (Horo Quan)',
    hours: '11:00 - 21:00',
    contact: '배달K / Grab 이용',
    desc: '호이안 올드타운에서 가장 평점 좋은 로컬 맛집. 타마린드 새우와 스프링롤은 배달로 먹어도 일품입니다.',
    menu: [
      { name: '타마린드 새우 (필수)', price: '125,000₫' },
      { name: '스프링롤 믹스 플래터', price: '95,000₫' },
      { name: '화이트 로즈', price: '65,000₫' }
    ]
  },
  {
    category: '한식/현지식 배달 🍚',
    name: '달빛식당 (Dalbit)',
    hours: '10:00 - 21:00',
    contact: '카카오톡: 달빛식당 호이안',
    desc: '호이안 리조트 지역 인기 배달 맛집. 삼겹살 정식부터 찌개류까지 한국의 맛이 그리울 때 추천합니다.',
    menu: [
      { name: '삼겹살 정식 (강추)', price: '250,000₫' },
      { name: '김치찌개 / 된장찌개', price: '150,000₫' },
      { name: '모닝글로리 덮밥', price: '120,000₫' }
    ]
  },
  {
    category: '호이안 치킨 야식 🍗',
    name: '브로스치킨 (Bros Chicken)',
    hours: '15:00 - 23:00',
    contact: '카카오톡: 호이안 브로스치킨',
    desc: '호이안 리조트까지 따끈하게 치킨을 배달해 줍니다. 아이들이 있는 가족 단위 여행객에게 인기가 높습니다.',
    menu: [
      { name: '양념 치킨 한 마리', price: '330,000₫' },
      { name: '간장 치킨 세트', price: '350,000₫' },
      { name: '떡볶이 추가', price: '120,000₫' }
    ]
  },
  {
    category: '전설의 반미 🥖',
    name: '반미프엉 (Banh Mi Phuong)',
    hours: '06:30 - 21:30',
    contact: 'Grab 푸드 이용 추천',
    desc: '호이안에서 가장 유명한 반미집. 줄 서지 말고 그랩으로 배달시키세요. 3번(믹스) 메뉴가 가장 인기 있습니다.',
    menu: [
      { name: '3번 믹스 반미', price: '35,000₫' },
      { name: '5번 바베큐 반미', price: '30,000₫' },
      { name: '치킨 반미', price: '30,000₫' }
    ]
  },
  {
    category: '반미의 여왕 🥖',
    name: '마담콴 (Madam Khanh)',
    hours: '07:00 - 19:00',
    contact: 'Grab 푸드 이용 추천',
    desc: '반미프엉과 쌍벽을 이루는 곳. 소스가 더 진하고 풍부한 맛이 특징입니다. 현지인들이 더 선호하기도 해요.',
    menu: [
      { name: 'The Mixed 반미', price: '30,000₫' },
      { name: 'BBQ 포크 반미', price: '30,000₫' },
      { name: '오믈렛 반미', price: '25,000₫' }
    ]
  },
  {
    category: '현지식 전문점 🍜',
    name: '포슈아 (Pho Xua)',
    hours: '10:00 - 21:00',
    contact: '배달K / Grab 이용',
    desc: '올드타운 가성비 1순위 맛집. 분짜와 프라이드 완탄이 한국인 입맛에 딱 맞습니다.',
    menu: [
      { name: '분짜 (BUN CHA)', price: '55,000₫' },
      { name: '프라이드 완탄', price: '60,000₫' },
      { name: '모닝글로리 볶음', price: '50,000₫' }
    ]
  },
  {
    category: '퓨전 한식/베트남식 🍱',
    name: '윤식당 호이안 (Yoon)',
    hours: '11:00 - 21:00',
    contact: '배달K / 카톡: 윤식당호이안',
    desc: '깔끔한 인테리어로 유명한 맛집의 배달 서비스. 정갈한 세트 메뉴 구성으로 가족 식사에 좋습니다.',
    menu: [
      { name: '김치찌개 세트', price: '180,000₫' },
      { name: '베트남 플래터', price: '250,000₫' },
      { name: '불고기 덮밥', price: '150,000₫' }
    ]
  },
  {
    category: '커피 & 디저트 ☕',
    name: '미노커피 (Mino Coffee)',
    hours: '08:00 - 21:00',
    contact: '카카오톡: minocoffee',
    desc: '코코넛 스무디 커피가 정말 맛있는 곳. 리조트에서 시원하게 카페인 충전하고 싶을 때 추천합니다.',
    menu: [
      { name: '코코넛 커피 (시그니처)', price: '45,000₫' },
      { name: '솔트 커피', price: '40,000₫' },
      { name: '망고 스무디', price: '50,000₫' }
    ]
  }
];

const DeliveryCard: React.FC<{ spot: any }> = ({ spot }) => (
  <div className="glass-card overflow-hidden">
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
        {spot.menu.map((m: any, i: number) => (
          <div key={i} className="flex justify-between items-center bg-white/3 border-l-2 border-coral/30 p-2 rounded-r-lg transition-all hover:bg-white/5 hover:border-coral group">
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
  const [isHoianDeliveryOpen, setIsHoianDeliveryOpen] = useState(false);

  const fruits = SEASONAL_FRUITS[selectedMonth] || [];

  return (
    <div className="pb-10 px-4 space-y-6">
  return (
    <div className="pb-10 px-4 space-y-4">
      {/* 0. Vietnamese Food Section */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsVnFoodOpen(!isVnFoodOpen)}
          className="w-full flex items-center justify-between p-3.5"
        >
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-mango" />
            <h2 className="text-lg font-black text-mango tracking-tight">베트남 음식 대백과</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isVnFoodOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-mango rotate-90" />
          </div>
        </button>
        
        {isVnFoodOpen && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300 divide-y divide-white/5">
            {VIETNAMESE_FOOD_DATA.map((food, idx) => (
              <FoodAccordionItem key={idx} food={food} />
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
          <div className={cn("transition-transform duration-300", !isFruitOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-teal rotate-90" />
          </div>
        </button>
        
        {isFruitOpen && (
          <div className="px-4 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
              <p className="text-[10px] text-mango/80 font-bold mb-3 uppercase tracking-wider">지금 가장 맛있는 {selectedMonth}월 과일</p>
              <div className="grid grid-cols-4 gap-3">
                {(SEASONAL_FRUITS[selectedMonth] || []).map((fruit, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5">
                      {fruit.icon}
                    </div>
                    <span className="text-[10px] font-black text-text-primary text-center">{fruit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shopping Items Section */}
      <section className="bg-navy-sub/20 rounded-2xl p-0.5 border border-white/5">
        <button 
          onClick={() => setIsShoppingOpen(!isShoppingOpen)}
          className="w-full flex items-center justify-between p-3.5"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-coral" />
            <h2 className="text-lg font-black text-coral tracking-tight">쇼핑 추천템</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isShoppingOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-coral rotate-90" />
          </div>
        </button>

        {isShoppingOpen && (
          <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-1.5 mb-5">
              {SHOPPING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                    activeTab === cat.id 
                      ? "bg-coral text-white border-coral shadow-md" 
                      : "bg-navy-sub/50 text-text-secondary border-white/5"
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {SHOPPING_CATEGORIES.find(c => c.id === activeTab)?.items.map((item, idx) => (
                <div key={idx} className="glass-card p-3 flex flex-col gap-1 border-l-2 border-l-coral shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[13px] font-black text-text-primary">{item.name}</h3>
                    <span className="text-[9px] text-mango font-bold bg-mango/10 px-1.5 py-0.5 rounded-full">{item.price}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Delivery Recommendations (Da Nang) */}
      <section className="bg-navy-sub/20 rounded-3xl p-1 border border-white/5">
        <button 
          onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-coral" />
            <h2 className="text-xl font-black text-coral">리조트 배달 맛집 (다낭)</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isDeliveryOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-coral rotate-90" />
          </div>
        </button>

        {isDeliveryOpen && (
          <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {DELIVERY_SPOTS_DANANG.map((spot, idx) => (
              <DeliveryCard key={idx} spot={spot} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Delivery Recommendations (Hoi An) */}
      <section className="bg-navy-sub/20 rounded-3xl p-1 border border-white/5">
        <button 
          onClick={() => setIsHoianDeliveryOpen(!isHoianDeliveryOpen)}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-mint" />
            <h2 className="text-xl font-black text-mint">리조트 배달 맛집 (호이안)</h2>
          </div>
          <div className={cn("transition-transform duration-300", !isHoianDeliveryOpen && "rotate-180")}>
            <ChevronRight className="w-5 h-5 text-mint rotate-90" />
          </div>
        </button>

        {isHoianDeliveryOpen && (
          <div className="px-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {DELIVERY_SPOTS_HOIAN.map((spot, idx) => (
              <DeliveryCard key={idx} spot={spot} />
            ))}
          </div>
        )}
      </section>

      {/* 5. General Tips */}
      <div className="px-2 pt-2 pb-4">
        <div className="bg-navy-card/50 rounded-2xl p-4 border border-white/5">
          <h3 className="text-xs font-bold text-text-hint mb-3 uppercase tracking-wider">💡 배달 이용 꿀팁</h3>
          <ul className="space-y-2 text-[11px] text-text-secondary leading-relaxed">
            <li className="flex gap-2">
              <span className="text-coral">•</span>
              <span>배달 앱(배달K, 그랩)을 이용하면 더 많은 로컬 맛집을 찾을 수 있습니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-coral">•</span>
              <span>리조트 보안상 객실 앞까지 배달이 불가능한 경우가 많으니 로비나 정문에서 수령하세요.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-coral">•</span>
              <span>카톡 주문 시 '호텔명/동/호수'를 명확히 남기면 의사소통이 훨씬 빠릅니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
