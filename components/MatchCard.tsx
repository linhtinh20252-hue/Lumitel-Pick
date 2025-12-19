import React from 'react';
import { Match, Pair, MatchStage } from '../types';

interface MatchCardProps {
  match: Match;
  pairA: Pair;
  pairB: Pair;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, pairA, pairB, onUpdateScore }) => {
  const [valA, setValA] = React.useState<string>(match.scoreA?.toString() || '');
  const [valB, setValB] = React.useState<string>(match.scoreB?.toString() || '');
  const [isLocked, setIsLocked] = React.useState<boolean>(match.isCompleted);
  const [isPrompting, setIsPrompting] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');

  React.useEffect(() => {
    setValA(match.scoreA?.toString() || '');
    setValB(match.scoreB?.toString() || '');
    setIsLocked(match.isCompleted);
  }, [match]);

  const handleSubmit = () => {
    const sA = parseInt(valA);
    const sB = parseInt(valB);
    if (!isNaN(sA) && !isNaN(sB)) {
      if (sA === sB) {
        alert("Pickleball không có kết quả hòa!");
        return;
      }
      onUpdateScore(match.id, sA, sB);
      setIsLocked(true);
      setIsPrompting(false);
    } else {
      alert("Vui lòng nhập đầy đủ điểm số!");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123') {
      setIsLocked(false);
      setIsPrompting(false);
      setPassword('');
    } else {
      alert("Sai mật khẩu!");
      setPassword('');
    }
  };

  const winnerId = match.isCompleted ? (match.scoreA! > match.scoreB! ? pairA.id : pairB.id) : null;
  const isFinal = match.stage === MatchStage.FINAL;

  return (
    <div className={`bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md border-2 transition-all relative overflow-hidden group ${isLocked ? 'border-gray-200 bg-gray-50/30' : 'border-lumitel-blue bg-white shadow-xl ring-2 ring-lumitel-blue/20'}`}>
      <div className="absolute top-0 right-0 p-1 opacity-5 text-xl md:text-2xl group-hover:rotate-12 transition-transform pointer-events-none">🎾</div>
      
      <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-[0.2em] border-b border-gray-50 pb-2 mb-4">
        <div className="flex items-center gap-1.5 md:gap-2">
           <span className={`${isLocked ? 'text-gray-400' : 'text-lumitel-blue'} font-black truncate max-w-[80px] md:max-w-none`}>{match.label || 'TRẬN ĐẤU'}</span>
           <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-200 whitespace-nowrap uppercase">CHẠM {match.targetScore}</span>
        </div>
        {match.isCompleted && isLocked ? (
          <span className="text-green-600 font-bold flex items-center gap-1">✓ ĐÃ LƯU</span>
        ) : !isLocked ? (
          <span className="text-lumitel-blue font-bold flex items-center gap-1 animate-pulse">✏️ ĐANG SỬA...</span>
        ) : (
          <span className="text-orange-500 italic flex items-center gap-1">ĐANG CHỜ...</span>
        )}
      </div>
      
      <div className="grid grid-cols-7 items-center gap-1.5 md:gap-3 relative z-10 mb-5">
        {/* Đội A */}
        <div className="col-span-2 text-center flex flex-col items-center justify-end h-full">
          {winnerId === pairA.id && (
            <div className="mb-1 animate-bounce text-xl md:text-2xl">
              {isFinal ? '🏆' : '⭐'}
            </div>
          )}
          <p className={`font-black text-[10px] md:text-xs leading-tight uppercase line-clamp-2 tracking-tighter transition-all duration-300 ${winnerId === pairA.id ? 'text-lumitel-blue scale-110' : winnerId === pairB.id ? 'text-gray-300 opacity-60' : 'text-gray-800'}`}>
            {pairA.name}
          </p>
        </div>
        
        {/* Tỉ số */}
        <div className="col-span-3 flex items-center justify-center gap-1 md:gap-2">
          <input 
            type="number" 
            value={valA} 
            readOnly={isLocked}
            onChange={(e) => setValA(e.target.value)}
            className={`w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black border-2 rounded-xl md:rounded-2xl outline-none transition-all shadow-inner p-0 
              ${isLocked ? (winnerId === pairA.id ? 'bg-lumitel-yellow border-lumitel-yellow text-lumitel-blue' : 'bg-gray-100 border-gray-200 text-gray-400') : 'bg-white border-lumitel-blue text-lumitel-blue focus:ring-4 focus:ring-lumitel-yellow shadow-lg'}`}
            placeholder="-"
          />
          <span className={`font-black text-xl md:text-2xl italic ${isLocked ? 'text-gray-200' : 'text-lumitel-blue'}`}>-</span>
          <input 
            type="number" 
            value={valB} 
            readOnly={isLocked}
            onChange={(e) => setValB(e.target.value)}
            className={`w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black border-2 rounded-xl md:rounded-2xl outline-none transition-all shadow-inner p-0 
              ${isLocked ? (winnerId === pairB.id ? 'bg-lumitel-yellow border-lumitel-yellow text-lumitel-blue' : 'bg-gray-100 border-gray-200 text-gray-400') : 'bg-white border-lumitel-blue text-lumitel-blue focus:ring-4 focus:ring-lumitel-yellow shadow-lg'}`}
            placeholder="-"
          />
        </div>

        {/* Đội B */}
        <div className="col-span-2 text-center flex flex-col items-center justify-end h-full">
          {winnerId === pairB.id && (
            <div className="mb-1 animate-bounce text-xl md:text-2xl">
              {isFinal ? '🏆' : '⭐'}
            </div>
          )}
          <p className={`font-black text-[10px] md:text-xs leading-tight uppercase line-clamp-2 tracking-tighter transition-all duration-300 ${winnerId === pairB.id ? 'text-lumitel-blue scale-110' : winnerId === pairA.id ? 'text-gray-300 opacity-60' : 'text-gray-800'}`}>
            {pairB.name}
          </p>
        </div>
      </div>

      {!isLocked ? (
        <button 
          onClick={handleSubmit}
          className="w-full py-2.5 md:py-3 bg-lumitel-blue text-white rounded-xl md:rounded-2xl font-black hover:bg-blue-800 transition-all text-[10px] uppercase tracking-wider active:scale-95 border-b-4 border-blue-900 flex items-center justify-center gap-2"
        >
          <span>💾</span> XÁC NHẬN KẾT QUẢ
        </button>
      ) : isPrompting ? (
        <form onSubmit={handlePasswordSubmit} className="flex gap-2 animate-in slide-in-from-bottom duration-300">
          <input 
            autoFocus
            type="password"
            placeholder="Nhập Pass..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-white border-2 border-lumitel-blue rounded-xl px-3 py-1.5 text-xs font-black text-lumitel-blue focus:outline-none"
          />
          <button 
            type="submit"
            className="bg-lumitel-blue text-white px-3 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-widest"
          >
            OK
          </button>
          <button 
            type="button"
            onClick={() => setIsPrompting(false)}
            className="bg-gray-200 text-gray-500 px-3 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-widest"
          >
            HUỶ
          </button>
        </form>
      ) : (
        <button 
          onClick={() => setIsPrompting(true)}
          className="w-full py-2 md:py-2.5 bg-gray-50 text-gray-400 rounded-xl md:rounded-2xl font-black hover:bg-gray-100 hover:text-gray-600 transition-all text-[8px] md:text-[9px] uppercase tracking-widest active:scale-95 border border-gray-200 flex items-center justify-center gap-1.5"
        >
          <span>🔒</span> NHẬP SAI? (MẬT KHẨU)
        </button>
      )}
    </div>
  );
};

export default MatchCard;