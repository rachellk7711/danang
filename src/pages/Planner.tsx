import { Bed, Plus, CheckCircle2, StickyNote, MapPin } from 'lucide-react';

export const PlannerPage = ({ onGoExplore }: { onGoExplore: () => void }) => {
  return (
    <div className="pb-10 px-4">
      {/* Accommodation Summary */}
      <div className="glass-card p-4 mb-6 bg-navy-sub/50 border-teal/20">
        <div className="flex items-center gap-2 mb-3">
          <Bed className="w-4 h-4 text-teal" />
          <h3 className="font-bold text-sm text-teal">현재 숙소</h3>
        </div>
        <p className="text-lg font-bold mb-1">빈펄 리조트 & 골프 남호이안</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          Bình Minh, Thăng Bình District, Quảng Nam, Vietnam
        </p>
      </div>

      {/* Daily Schedule */}
      <div className="space-y-6">
        <div className="relative pl-6 border-l border-white/10 space-y-4">
          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-teal rounded-full shadow-[0_0_8px_rgba(14,124,123,0.5)]" />
          <div>
            <span className="text-[10px] font-bold text-teal tracking-wider uppercase">DAY 1 - 5월 10일</span>
            <h4 className="text-lg font-bold">다낭 도착 및 시내 구경</h4>
          </div>

          <div className="space-y-3">
            <div className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-mint" />
                </div>
                <span className="text-sm font-medium">공항 그랩 이동</span>
              </div>
              <span className="text-[10px] text-text-hint">14:00 완료</span>
            </div>

            <div className="glass-card p-3 flex items-center justify-between bg-white/5 border-dashed border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-text-secondary" />
                </div>
                <span className="text-sm text-text-secondary italic">다음 일정 메모 추가...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Area */}
        <div className="glass-card p-4 bg-navy-card">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-forsythia" />
            <h3 className="font-bold text-sm text-forsythia">메모</h3>
          </div>
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-text-secondary placeholder:text-text-hint resize-none h-24"
            placeholder="아이들과 가고 싶은 곳, 사야할 것들을 적어보세요."
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <button 
          onClick={onGoExplore}
          className="w-full bg-gradient-to-r from-teal to-mint text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-teal/20"
        >
          <MapPin className="w-5 h-5" />
          지금 여기서 뭐하지?
        </button>
      </div>
    </div>
  );
};
