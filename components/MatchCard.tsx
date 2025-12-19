import React from 'react';
import { Match, Pair } from '../types';

interface MatchCardProps {
  match: Match;
  pairA: Pair;
  pairB: Pair;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, pairA, pairB, onUpdateScore }) => {
  const [valA, setValA] = React.useState<string>(match.scoreA?.toString() || '');
  const [valB, setValB] = React.useState<string>(match.scoreB?.toString() || '');

  const handleSubmit = () => {
    const sA = parseInt(valA);
    const sB = parseInt(valB);
    if (!isNaN(sA) && !isNaN(sB)) {
      onUpdateScore(match.id, sA, sB);
    }
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md border-2 border-gray-100 flex flex-col gap-3 md:gap-4 hover:shadow-xl hover:border-lumitel-yellow transition-all relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-1 opacity-5 text-xl md:text-2xl group-hover:rotate-12 transition-transform pointer-events-none">🎾</div>
      <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-[0.2em] border-b border-gray-50 pb-2">
        <div className="flex items-center gap-1.5 md:gap-2">
           <span className="text-lumitel-blue font-black truncate max-w-[80px] md:max-w-none">{match.label || 'TRẬN ĐẤU'}</span>
           <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200 whitespace-nowrap">CHẠM {match.targetScore}</span>
        </div>
        {match.isCompleted ? (
          <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full shadow-sm">✓ XONG</span>
        ) : (
          <span className="text-orange-500 italic flex items-center gap-1">Chờ 🎾</span>
        )}
      </div>
      
      <div className="grid grid-cols-7 items-center gap-1.5 md:gap-3 relative z-10">
        <div className="col-span-2 text-right">
          <p className="font-black text-[10px] md:text-sm text-gray-800 leading-tight uppercase line-clamp-2 tracking-tighter">{pairA.name}</p>
        </div>
        
        <div className="col-span-3 flex items-center justify-center gap-1 md:gap-2">
          <input 
            type="number" 
            value={valA} 
            onChange={(e) => setValA(e.target.value)}
            className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black border-2 border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-lumitel-yellow focus:border-lumitel-blue outline-none transition-all bg-gray-50 text-gray-900 shadow-inner p-0"
            placeholder="-"
          />
          <span className="text-lumitel-blue font-black text-xl md:text-2xl italic">:</span>
          <input 
            type="number" 
            value={valB} 
            onChange={(e) => setValB(e.target.value)}
            className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black border-2 border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-lumitel-yellow focus:border-lumitel-blue outline-none transition-all bg-gray-50 text-gray-900 shadow-inner p-0"
            placeholder="-"
          />
        </div>

        <div className="col-span-2 text-left">
          <p className="font-black text-[10px] md:text-sm text-gray-800 leading-tight uppercase line-clamp-2 tracking-tighter">{pairB.name}</p>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        className="w-full py-2.5 md:py-3 bg-lumitel-blue text-white rounded-xl md:rounded-2xl font-black hover:bg-blue-800 transition-all text-[8px] md:text-[10px] uppercase tracking-wider md:tracking-[0.2em] active:scale-95 border-b-4 border-blue-900 flex items-center justify-center gap-1.5 md:gap-2"
      >
        <span>💾</span> LƯU KẾT QUẢ
      </button>
    </div>
  );
};

export default MatchCard;
