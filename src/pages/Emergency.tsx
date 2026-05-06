import { useState } from 'react';
import { Phone, MapPin, Languages, AlertCircle, Volume2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PHRASES = [
  { kr: "도와주세요!", vn: "Cứu tôi với!", pr: "끄우 또이 버이!" },
  { kr: "가까운 병원이 어디인가요?", vn: "Bệnh viện gần nhất ở đâu?", pr: "벵 비엔 건 녓 어 더우?" },
  { kr: "구급차를 불러주세요.", vn: "Làm ơn gọi xe cấp cứu.", pr: "람 언 고이 쌔 껍 끄우." },
  { kr: "경찰을 불러주세요.", vn: "Làm ơn gọi cảnh sát.", pr: "람 언 고이 가인 쌋." },
  { kr: "지갑을 잃어버렸어요.", vn: "Tôi bị mất ví.", pr: "또이 비 멋 비." },
  { kr: "아이가 아파요.", vn: "Con tôi bị ốm.", pr: "꼰 또이 비 옴." },
];

export const EmergencyPage = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'phrases'>('contact');

  return (
    <div className="pt-28 pb-10 px-4">
      {/* Sub Tabs */}
      <div className="flex bg-navy-sub p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('contact')}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === 'contact' ? "bg-coral text-white shadow-lg" : "text-text-secondary"
          )}
        >
          <Phone className="w-4 h-4" />
          긴급 연락처
        </button>
        <button 
          onClick={() => setActiveTab('phrases')}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === 'phrases' ? "bg-coral text-white shadow-lg" : "text-text-secondary"
          )}
        >
          <Languages className="w-4 h-4" />
          긴급 회화
        </button>
      </div>

      {activeTab === 'contact' ? (
        <div className="space-y-4">
          <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center shadow-lg shadow-coral/20">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-coral">범죄신고 (경찰)</h3>
                <p className="text-2xl font-black text-coral">113</p>
              </div>
            </div>
            <button className="p-3 bg-coral/20 rounded-full">
              <Phone className="w-5 h-5 text-coral" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-secondary">화재신고 (소방)</h3>
                <p className="text-2xl font-black text-text-primary">114</p>
              </div>
            </div>
            <button className="p-3 bg-white/5 rounded-full">
              <Phone className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-secondary">응급구조 (구급차)</h3>
                <p className="text-2xl font-black text-text-primary">115</p>
              </div>
            </div>
            <button className="p-3 bg-white/5 rounded-full">
              <Phone className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <section className="mt-8 space-y-3">
            <h4 className="text-xs font-bold text-text-hint px-1">추천 병원 (다낭)</h4>
            <div className="glass-card p-4">
              <h5 className="font-bold text-sm mb-1">다낭 패밀리 메디컬 프랙티스</h5>
              <p className="text-[11px] text-text-secondary mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 95-97-99 Vo Nguyen Giap, Da Nang
              </p>
              <button className="w-full bg-white/5 py-2 rounded-lg text-xs font-bold">지도 보기</button>
            </div>
          </section>
        </div>
      ) : (
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
              <button className="p-2 group-active:text-coral transition-colors">
                <Volume2 className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
