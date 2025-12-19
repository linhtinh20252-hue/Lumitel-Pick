
import React from 'react';
import { Match, Pair, MatchStage, SetScore } from '../types';

interface MatchCardProps {
  match: Match;
  pairA: Pair;
  pairB: Pair;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number, sets: SetScore[]) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, pairA, pairB, onUpdateScore }) => {
  const isBestOf3 = match.matchFormat === 3;
  const initialSets = match.sets || (isBestOf3 ? [{ a: 0, b: 0 }, { a: 0, b: 0 }, { a: 0, b: 0 }] : [{ a: 0, b: 0 }]);
  
  const [sets, setSets] = React.useState<SetScore[]>(initialSets);
  const [isLocked, setIsLocked] = React.useState<boolean>(match.isCompleted);
  const [isPrompting, setIsPrompting] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');

  React.useEffect(() => {
    if (match.sets) setSets(match.sets);
    setIsLocked(match.isCompleted);
  }, [match]);

  const updateSetScore = (idx: number, side: 'a' | 'b', val: string) => {
    const num = parseInt(val) || 0;
    const newSets = [...sets];
    newSets[idx] = { ...newSets[idx], [side]: num };
    setSets(newSets);
  };

  // Tự động tính tỷ số set thắng dựa trên điểm hiệp
  const calculatedWins = React.useMemo(() => {
    let winsA = 0;
    let winsB = 0;
    sets.forEach(s => {
      if (s.a === 0 && s.b === 0) return;
      if (s.a > s.b) winsA++;
      else if (s.b > s.a) winsB++;
    });
    return { a: winsA, b: winsB };
  }, [sets]);

  const handleSubmit = () => {
    if (calculatedWins.a === calculatedWins.b && (calculatedWins.a !== 0 || calculatedWins.b !== 0)) {
      alert("Trận đấu chưa có đội thắng cuộc rõ ràng!");
      return;
    }
    
    // Kiểm tra hòa trong set
    const hasDrawSet = sets.some(s => s.a === s.b && (s.a !== 0 || s.b !== 0));
    if (hasDrawSet) {
      alert("Set đấu không thể có kết quả hòa!");
      return;
    }

    onUpdateScore(match.id, calculatedWins.a, calculatedWins.b, sets);
    setIsLocked(true);
    setIsPrompting(false);
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
           <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-200 whitespace-nowrap uppercase">
             {isBestOf3 ? 'BEST OF 3' : '1 SET'} - CHẠM {match.targetScore}
           </span>
        </div>
        {match.isCompleted && isLocked ? (
          <span className="text-green-600 font-bold flex items-center gap-1">✓ ĐÃ LƯU</span>
        ) : !isLocked ? (
          <span className="text-lumitel-blue font-bold flex items-center gap-1 animate-pulse">✏️ NHẬP ĐIỂM</span>
        ) : (
          <span className="text-orange-500 italic flex items-center gap-1">ĐANG CHỜ...</span>
        )}
      </div>
      
      <div className="grid grid-cols-7 items-center gap-1.5 md:gap-3 relative z-10 mb-5">
        <div className="col-span-2 text-center flex flex-col items-center justify-end h-full">
          {winnerId === pairA.id && <div className="mb-1 animate-bounce text-xl md:text-2xl">{isFinal ? '🏆' : '⭐'}</div>}
          <p className={`font-black text-[10px] md:text-xs leading-tight uppercase line-clamp-2 tracking-tighter transition-all duration-300 ${winnerId === pairA.id ? 'text-lumitel-blue scale-110' : winnerId === pairB.id ? 'text-gray-300 opacity-60' : 'text-gray-800'}`}>
            {pairA.name}
          </p>
        </div>
        
        <div className="col-span-3 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-2xl md:text-4xl font-black italic ${isLocked ? (winnerId === pairA.id ? 'text-lumitel-blue' : 'text-gray-300') : 'text-lumitel-blue'}`}>{calculatedWins.a}</span>
            <span className="text-gray-200 font-black text-xl">-</span>
            <span className={`text-2xl md:text-4xl font-black italic ${isLocked ? (winnerId === pairB.id ? 'text-lumitel-blue' : 'text-gray-300') : 'text-lumitel-blue'}`}>{calculatedWins.b}</span>
          </div>
          <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">Tỉ số Trận</span>
        </div>

        <div className="col-span-2 text-center flex flex-col items-center justify-end h-full">
          {winnerId === pairB.id && <div className="mb-1 animate-bounce text-xl md:text-2xl">{isFinal ? '🏆' : '⭐'}</div>}
          <p className={`font-black text-[10px] md:text-xs leading-tight uppercase line-clamp-2 tracking-tighter transition-all duration-300 ${winnerId === pairB.id ? 'text-lumitel-blue scale-110' : winnerId === pairA.id ? 'text-gray-300 opacity-60' : 'text-gray-800'}`}>
            {pairB.name}
          </p>
        </div>
      </div>

      <div className={`grid gap-2 mb-5 ${isBestOf3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {sets.map((set, idx) => (
          <div key={idx} className={`p-2 rounded-xl border transition-all ${isLocked ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 group-hover:border-lumitel-blue/30'}`}>
            <div className="text-[7px] font-black text-gray-400 uppercase text-center mb-1">Set {idx + 1}</div>
            <div className="flex items-center justify-center gap-1">
              <input 
                type="number" 
                value={set.a || ''} 
                disabled={isLocked}
                onChange={(e) => updateSetScore(idx, 'a', e.target.value)}
                className={`w-full h-8 text-center font-black text-sm rounded-lg border outline-none ${isLocked ? 'bg-transparent border-transparent text-gray-400' : 'bg-white border-gray-200 focus:border-lumitel-blue text-lumitel-blue'}`}
                placeholder="0"
              />
              <span className="text-gray-300 font-bold">-</span>
              <input 
                type="number" 
                value={set.b || ''} 
                disabled={isLocked}
                onChange={(e) => updateSetScore(idx, 'b', e.target.value)}
                className={`w-full h-8 text-center font-black text-sm rounded-lg border outline-none ${isLocked ? 'bg-transparent border-transparent text-gray-400' : 'bg-white border-gray-200 focus:border-lumitel-blue text-lumitel-blue'}`}
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>

      {!isLocked ? (
        <button 
          onClick={handleSubmit}
          className="w-full py-2.5 bg-lumitel-blue text-white rounded-xl font-black hover:bg-blue-800 transition-all text-[10px] uppercase active:scale-95 border-b-4 border-blue-900"
        >
          LƯU KẾT QUẢ
        </button>
      ) : isPrompting ? (
        <form onSubmit={handlePasswordSubmit} className="flex gap-2">
          <input 
            autoFocus
            type="password"
            placeholder="Pass..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-white border border-lumitel-blue rounded-lg px-2 py-1 text-xs font-black text-lumitel-blue"
          />
          <button type="submit" className="bg-lumitel-blue text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase">OK</button>
          <button type="button" onClick={() => setIsPrompting(false)} className="bg-gray-200 text-gray-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase">X</button>
        </form>
      ) : (
        <button 
          onClick={() => setIsPrompting(true)}
          className="w-full py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[8px] uppercase border border-gray-200 hover:bg-gray-100"
        >
          SỬA ĐIỂM (123)
        </button>
      )}
    </div>
  );
};

export default MatchCard;
