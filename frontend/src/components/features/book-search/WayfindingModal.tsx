import React, { useEffect, useState } from 'react';
import { X, MapPin, Navigation, Compass } from 'lucide-react';

interface WayfindingModalProps {
  location: string;
  bookTitle: string;
  onClose: () => void;
}

const WayfindingModal: React.FC<WayfindingModalProps> = ({ location, bookTitle, onClose }) => {
  const [step, setStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Extract floor number from location (e.g., "3rd Floor, QA76.A67" -> "3")
  const floorMatch = location.match(/(\d+)st|\d+nd|\d+rd|\d+th\s+Floor/i);
  const floorNumber = floorMatch ? floorMatch[0].charAt(0) : '1';
  const sectionMatch = location.split(',')[1]?.trim() || 'A区';

  useEffect(() => {
    if (isNavigating) {
      const timer1 = setTimeout(() => setStep(1), 1000);
      const timer2 = setTimeout(() => setStep(2), 2500);
      const timer3 = setTimeout(() => setStep(3), 4000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStep(0);
    }
  }, [isNavigating]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 sm:p-6 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden rounded-[24px] bg-white/95 shadow-2xl border border-white/20 animate-scale-in">
        
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">室内AR寻书指引</h3>
              <p className="text-xs text-slate-500 max-w-[200px] truncate">{bookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 relative bg-slate-50">
          {!isNavigating ? (
            <div className="text-center py-6">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">目标：{location}</h4>
              <p className="text-slate-500 mb-8">开启实景导航，我们将指引您前往目标书架</p>
              <button
                onClick={() => setIsNavigating(true)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all active:scale-95"
              >
                <Navigation className="w-5 h-5" /> 开始室内导航
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 h-[300px] shadow-inner border border-slate-200">
              {/* Simulated 3D Map View */}
              <div className="absolute inset-0 opacity-20" 
                   style={{
                     backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
                     backgroundSize: '20px 20px',
                     transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                   }}
              ></div>
              
              {/* Path animation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }}>
                <path 
                  d="M 50,300 Q 150,200 250,150 T 400,50" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4" 
                  strokeDasharray="10,10"
                  className="animate-[dash_1s_linear_infinite]"
                />
                {step >= 3 && (
                  <circle cx="400" cy="50" r="8" fill="#10b981" className="animate-pulse" />
                )}
              </svg>
              
              <style>{`
                @keyframes dash {
                  to { stroke-dashoffset: -20; }
                }
              `}</style>

              <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-500 ${step >= 3 ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                    {step >= 3 ? '✓' : step}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">
                      {step === 0 && "正在规划路线..."}
                      {step === 1 && `乘坐电梯或楼梯前往 ${floorNumber} 楼`}
                      {step === 2 && `进入 ${floorNumber} 楼，向 ${sectionMatch.charAt(0)} 区方向前进`}
                      {step === 3 && `已到达目标书架：${sectionMatch}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step < 3 ? "距离目标约 45 米" : "请在第三层书架寻找"}
                    </p>
                  </div>
                </div>
              </div>
              
              {step >= 3 && (
                <div className="absolute bottom-4 left-4 right-4 animate-slide-up">
                  <button onClick={onClose} className="w-full py-3 bg-white text-slate-800 rounded-xl font-bold shadow-lg hover:bg-slate-50 active:scale-95 transition-all">
                    完成寻书
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WayfindingModal;