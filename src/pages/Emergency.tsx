import { Languages, Volume2 } from 'lucide-react';

const PHRASES = [
  { kr: "도와주세요!", vn: "Cứu tôi với!", pr: "끄우 또이 버이!" },
  { kr: "가까운 병원이 어디인가요?", vn: "Bệnh viện gần nhất ở đâu?", pr: "벵 비엔 건 녓 어 더우?" },
  { kr: "구급차를 불러주세요.", vn: "Làm ơn gọi xe cấp cứu.", pr: "람 언 고이 쌔 껍 끄우." },
  { kr: "경찰을 불러주세요.", vn: "Làm ơn gọi cảnh sát.", pr: "람 언 고이 가인 쌋." },
  { kr: "지갑을 잃어버렸어요.", vn: "Tôi bị mất ví.", pr: "또이 비 멋 비." },
  { kr: "아이가 아파요.", vn: "Con tôi bị ốm.", pr: "꼰 또이 비 옴." },
];

export const EmergencyPage = () => {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.8; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="pb-10 px-4">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Languages className="w-5 h-5 text-coral" />
        <h2 className="text-xl font-black text-text-primary">긴급 회화</h2>
      </div>

      <div className="space-y-3">
        {PHRASES.map((p, i) => (
          <div key={i} className="glass-card p-4 flex items-center justify-between group active:bg-white/5 transition-colors">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">{p.kr}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-coral font-medium tracking-tight">{p.vn}</span>
                <span className="text-[10px] text-text-hint">[{p.pr}]</span>
              </div>
            </div>
            <button 
              onClick={() => speak(p.vn)}
              className="p-2 hover:bg-coral/10 rounded-full transition-colors text-text-secondary hover:text-coral"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
