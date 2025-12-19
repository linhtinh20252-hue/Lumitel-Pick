
import React, { useState, useEffect } from 'react';
import { Player, Pair, Match, TournamentData, MatchStage } from './types';
import { INITIAL_PLAYERS, LOGO_SVG, LUMITEL_LOGO_SVG } from './constants';
import { saveTournament, loadTournament, clearTournament } from './services/storageService';
import { calculateStandings } from './utils/rankings';
import MatchCard from './components/MatchCard';
import StandingTable from './components/StandingTable';

// Hiệu ứng pháo hoa rực rỡ với thông tin đội vô địch
const Confetti = ({ onClose, winnerName }: { onClose: () => void; winnerName: string }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(80)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-10 - Math.random() * 20}%`,
            backgroundColor: ['#FFE200', '#005696', '#FF5733', '#C70039', '#900C3F', '#FFFFFF', '#00FF00'][Math.floor(Math.random() * 7)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.9
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-700 pointer-events-auto">
         <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border-[8px] md:border-[12px] border-lumitel-yellow text-center transform scale-100 md:scale-110 animate-bounce max-w-[90vw]">
            <div className="text-6xl md:text-8xl mb-4">🏆</div>
            <h2 className="text-3xl md:text-6xl font-black text-lumitel-blue mb-4 italic uppercase tracking-tighter leading-none">NHÀ VÔ ĐỊCH!</h2>
            
            <div className="mb-8 space-y-2">
              <p className="text-lg md:text-2xl font-bold text-gray-600 uppercase">Chúc mừng đội vô địch</p>
              <p className="text-2xl md:text-5xl font-black text-lumitel-blue uppercase italic tracking-tighter drop-shadow-sm">{winnerName}</p>
            </div>

            <p className="text-xs md:text-lg font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">KỶ NIỆM 10 NĂM LUMITEL</p>
            <button 
              onClick={onClose}
              className="bg-lumitel-blue text-white px-10 py-4 rounded-full font-black hover:scale-110 transition-transform pointer-events-auto shadow-xl text-lg md:text-xl uppercase italic active:scale-95"
            >
              HOÀN TẤT GIẢI ĐẤU
            </button>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<TournamentData | null>(null);
  const [activeTab, setActiveTab] = useState<'athletes' | 'pairs' | 'group' | 'knockout' | 'rules'>('athletes');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const saved = loadTournament();
    if (saved) {
      setData(saved);
    } else {
      const initialData: TournamentData = {
        players: INITIAL_PLAYERS,
        pairs: [],
        matches: [],
        config: { 
          pointsToWinGroup: 11, 
          pointsToWinKnockout: 15, 
          winByTwo: true 
        }
      };
      
      const shuffledPlayers = [...INITIAL_PLAYERS].sort(() => Math.random() - 0.5);
      const initialPairs: Pair[] = [];
      const pairCount = Math.floor(shuffledPlayers.length / 2);
      for (let i = 0; i < pairCount; i++) {
        initialPairs.push({
          id: `pair-${i}`,
          name: `${shuffledPlayers[i*2].name} & ${shuffledPlayers[i*2+1].name}`,
          playerIds: [shuffledPlayers[i*2].id, shuffledPlayers[i*2+1].id],
          groupId: i < Math.ceil(pairCount / 2) ? 'A' : 'B'
        });
      }
      setData({ ...initialData, pairs: initialPairs });
    }
  }, []);

  useEffect(() => {
    if (data) saveTournament(data);
  }, [data]);

  const addAthlete = () => {
    if (!data) return;
    const newId = Date.now().toString();
    const newPlayer: Player = { id: newId, name: `VĐV MỚI` };
    setData(prev => prev ? ({
      ...prev,
      players: [...prev.players, newPlayer]
    }) : null);
  };

  const deleteAthlete = (id: string) => {
    if (!data) return;
    setData(prev => prev ? ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }) : null);
    setConfirmDeleteId(null);
  };

  const updateAthleteName = (id: string, name: string) => {
    setData(prev => prev ? ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, name } : p)
    }) : null);
  };

  const updatePairName = (pairId: string, name: string) => {
    setData(prev => prev ? ({
      ...prev,
      pairs: prev.pairs.map(p => p.id === pairId ? { ...p, name } : p)
    }) : null);
  };

  const updateConfig = (key: keyof TournamentData['config'], value: any) => {
    setData(prev => prev ? ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }) : null);
  };

  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const generateRandomPairs = () => {
    if (!data) return;
    if (data.players.length % 2 !== 0) {
      alert("Số lượng VĐV phải là số chẵn để chia cặp! Hiện có " + data.players.length + " VĐV.");
      return;
    }
    const shuffledPlayers = shuffleArray(data.players);
    const newPairs: Pair[] = [];
    const pairCount = shuffledPlayers.length / 2;
    for (let i = 0; i < pairCount; i++) {
      const p1 = shuffledPlayers[i * 2];
      const p2 = shuffledPlayers[i * 2 + 1];
      newPairs.push({
        id: `pair-${i}`,
        name: `${p1.name} & ${p2.name}`,
        playerIds: [p1.id, p2.id],
        groupId: i < Math.ceil(pairCount / 2) ? 'A' : 'B'
      });
    }
    setData(prev => ({ ...prev!, pairs: newPairs, matches: [] }));
  };

  const createGroupMatches = () => {
    if (!data) return;
    const groupA = data.pairs.filter(p => p.groupId === 'A');
    const groupB = data.pairs.filter(p => p.groupId === 'B');
    if (groupA.length < 2 || groupB.length < 2) {
      alert("Mỗi bảng cần tối thiểu 2 cặp để thi đấu!");
      return;
    }

    const matches: Match[] = [];
    const generateMatchesForGroup = (groupPairs: Pair[], stage: MatchStage, groupLabel: string) => {
      let matchIdx = 1;
      for (let i = 0; i < groupPairs.length; i++) {
        for (let j = i + 1; j < groupPairs.length; j++) {
          matches.push({
            id: `${stage}-${i}-${j}`,
            stage: stage,
            pairAId: groupPairs[i].id,
            pairBId: groupPairs[j].id,
            scoreA: null, scoreB: null, winnerId: null, isCompleted: false,
            label: `${groupLabel}: Trận ${matchIdx++}`,
            targetScore: data.config.pointsToWinGroup
          });
        }
      }
    };

    generateMatchesForGroup(groupA, MatchStage.GROUP_A, 'Bảng A');
    generateMatchesForGroup(groupB, MatchStage.GROUP_B, 'Bảng B');

    setData({ ...data, matches });
    setActiveTab('group');
  };

  const updateMatchScore = (matchId: string, scoreA: number, scoreB: number) => {
    setData(prev => {
      if (!prev) return null;
      const newMatches = prev.matches.map(m => (m.id === matchId ? {
        ...m, scoreA, scoreB, winnerId: scoreA > scoreB ? m.pairAId : m.pairBId, isCompleted: true
      } : m));

      const currentMatch = newMatches.find(m => m.id === matchId);
      if (currentMatch?.stage === MatchStage.FINAL && currentMatch.isCompleted) {
        setShowCelebration(true);
      }

      return {
        ...prev,
        matches: newMatches
      };
    });
  };

  const resetTournament = () => {
    if (window.confirm("Bạn có chắc chắn muốn xoá toàn bộ dữ liệu và bắt đầu lại?")) {
      clearTournament();
      window.location.reload();
    }
  };

  const standingsA = calculateStandings(
    data?.pairs.filter(p => p.groupId === 'A') || [],
    data?.matches.filter(m => m.stage === MatchStage.GROUP_A) || []
  );

  const standingsB = calculateStandings(
    data?.pairs.filter(p => p.groupId === 'B') || [],
    data?.matches.filter(m => m.stage === MatchStage.GROUP_B) || []
  );

  const generateKnockout = () => {
    if (!data) return;
    if (standingsA.length < 2 || standingsB.length < 2) {
      alert("Cần tối thiểu 2 cặp mỗi bảng để đấu Bán Kết!");
      return;
    }
    const sf1: Match = {
      id: 'sf-1', stage: MatchStage.SEMI_FINAL, pairAId: standingsA[0].pairId, pairBId: standingsB[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 1',
      targetScore: data.config.pointsToWinKnockout
    };
    const sf2: Match = {
      id: 'sf-2', stage: MatchStage.SEMI_FINAL, pairAId: standingsB[0].pairId, pairBId: standingsA[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 2',
      targetScore: data.config.pointsToWinKnockout
    };
    setData({ ...data, matches: [...data.matches.filter(m => m.stage.startsWith('GROUP')), sf1, sf2] });
    setActiveTab('knockout');
  };

  const generateFinals = () => {
    if (!data) return;
    const sfMatches = data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL);
    if (sfMatches.some(m => !m.isCompleted)) { alert("Vui lòng nhập đủ kết quả Bán kết!"); return; }
    const m1 = sfMatches.find(m => m.id === 'sf-1')!;
    const m2 = sfMatches.find(m => m.id === 'sf-2')!;
    const winnerSF1 = m1.winnerId!;
    const loserSF1 = m1.winnerId === m1.pairAId ? m1.pairBId : m1.pairAId;
    const winnerSF2 = m2.winnerId!;
    const loserSF2 = m2.winnerId === m2.pairAId ? m2.pairBId : m2.pairAId;

    const final: Match = { id: 'm-final', stage: MatchStage.FINAL, pairAId: winnerSF1, pairBId: winnerSF2, scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Chung Kết', targetScore: data.config.pointsToWinKnockout };
    const third: Match = { id: 'm-third', stage: MatchStage.THIRD_PLACE, pairAId: loserSF1, pairBId: loserSF2, scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Tranh Hạng 3', targetScore: data.config.pointsToWinKnockout };

    setData({ ...data, matches: [...data.matches.filter(m => m.stage !== MatchStage.FINAL && m.stage !== MatchStage.THIRD_PLACE), third, final] });
  };

  // Lấy tên đội vô địch
  const finalMatch = data?.matches.find(m => m.stage === MatchStage.FINAL && m.isCompleted);
  const winningPair = finalMatch ? data?.pairs.find(p => p.id === finalMatch.winnerId) : null;
  const winnerName = winningPair?.name || "Đang cập nhật...";

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 selection:bg-lumitel-yellow selection:text-lumitel-blue">
      {showCelebration && <Confetti onClose={() => setShowCelebration(false)} winnerName={winnerName} />}

      <header className="bg-lumitel-blue text-white overflow-hidden relative shadow-2xl border-b-[4px] md:border-b-[6px] border-lumitel-yellow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
               {/* Logo Lumitel Header */}
               <div className="w-24 h-10 bg-lumitel-yellow rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                  <img src={LUMITEL_LOGO_SVG} alt="Lumitel" className="w-full h-full object-contain" />
               </div>
               <div className="inline-block bg-lumitel-yellow px-3 py-1 rounded-xl transform -rotate-2 shadow-sm">
                 <span className="text-lumitel-blue font-black tracking-widest uppercase italic text-[10px] md:text-sm">Hội Bu Kiều Burundi Presents</span>
               </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-3 leading-none tracking-tighter uppercase italic drop-shadow-2xl">
              KỶ NIỆM <span className="text-lumitel-yellow">10 NĂM</span> <br/>LUMITEL BURUNDI
            </h1>
            <p className="text-base md:text-2xl font-bold opacity-90 italic max-w-2xl">
              Giải Pickleball Open 2025 - 10 năm phát triển.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-4 mt-6">
              <div className="bg-lumitel-yellow text-lumitel-blue px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black shadow-[0_5px_0_#CCB500] text-xs md:text-base">HÀ NỘI, 20/12/2025</div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-base">{data?.players.length || 0} VẬN ĐỘNG VIÊN 🎾</div>
            </div>
          </div>
          <div className="relative shrink-0">
            <div className="w-48 h-48 md:w-80 md:h-80 bg-white rounded-[2rem] md:rounded-[3rem] p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-lumitel-yellow transform rotate-3 hover:rotate-0 transition-all duration-700 flex items-center justify-center overflow-hidden">
              <img src={LOGO_SVG} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-lumitel-yellow/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
      </header>

      <nav className="bg-white/90 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-2 py-2 flex justify-start md:justify-center space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'athletes', label: 'VĐV', fullLabel: 'Danh Sách VĐV', icon: '👤' },
            { id: 'pairs', label: 'Cặp', fullLabel: 'Cặp Thi Đấu', icon: '👥' },
            { id: 'group', label: 'Bảng', fullLabel: 'Vòng Bảng', icon: '📊' },
            { id: 'knockout', label: 'Loại', fullLabel: 'Vòng Loại', icon: '🏆' },
            { id: 'rules', label: 'Lệ', fullLabel: 'Thể Lệ', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-5 py-2 text-xs md:text-sm font-black transition-all whitespace-nowrap rounded-xl md:rounded-2xl flex items-center gap-1.5 ${
                activeTab === tab.id 
                ? 'bg-lumitel-blue text-white shadow-lg scale-105' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span> 
              <span className="hidden sm:inline">{tab.fullLabel}</span>
              <span className="inline sm:hidden">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-3 md:p-10">
        {activeTab === 'athletes' && data && (
          <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl md:shadow-2xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-3 md:gap-4">
              <h2 className="text-2xl md:text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-3">
                <span className="bg-lumitel-yellow p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg text-lg md:text-2xl">📝</span> QUẢN LÝ VĐV
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={addAthlete} className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow-md hover:bg-green-600 transition-all uppercase">+ Thêm VĐV</button>
                <p className="text-[10px] md:text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-lg">Nhấn tên để sửa</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {data.players.map((player, idx) => (
                <div key={player.id} className="group flex items-center bg-gray-50 p-4 rounded-xl md:rounded-[1.5rem] border-2 border-transparent hover:border-lumitel-yellow transition-all duration-300 relative shadow-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-lumitel-blue text-white rounded-lg flex items-center justify-center font-black text-xs md:text-base shrink-0 mr-3">{idx + 1}</div>
                  <div className="flex-1 overflow-hidden">
                    <input type="text" value={player.name} onChange={(e) => updateAthleteName(player.id, e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-black text-gray-900 text-sm md:text-base uppercase italic truncate" />
                  </div>
                  {confirmDeleteId === player.id ? (
                    <button onClick={() => deleteAthlete(player.id)} className="bg-red-500 text-white text-[8px] px-2 py-1 rounded font-black">XÓA</button>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(player.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-center"><button onClick={() => setActiveTab('pairs')} className="bg-lumitel-blue text-white px-14 py-6 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase italic">TIẾP TỤC ➔</button></div>
          </div>
        )}

        {activeTab === 'pairs' && data && (
          <div className="space-y-6 md:space-y-12">
            <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left border border-gray-100">
              <div>
                <h3 className="text-xl md:text-3xl font-black text-lumitel-blue uppercase italic">SẮP XẾP CẶP ĐẤU 👥</h3>
                <p className="text-gray-500 font-bold text-xs md:text-lg italic">Bốc thăm chia cặp tự động</p>
              </div>
              <button onClick={generateRandomPairs} className="bg-lumitel-yellow text-lumitel-blue px-8 py-4 rounded-[1.5rem] font-black shadow-[0_5px_0_#CCB500] hover:translate-y-1 transition-all uppercase italic">🔄 BỐC THĂM LẠI</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {['A', 'B'].map(g => (
                <div key={g} className="space-y-4 md:space-y-6">
                  <h4 className="text-lg md:text-2xl font-black text-lumitel-blue flex items-center gap-3 px-2 uppercase italic">BẢNG {g}</h4>
                  {data.pairs.filter(p => p.groupId === g).map((pair, idx) => (
                    <div key={pair.id} className="bg-white p-5 md:p-8 rounded-xl md:rounded-[2rem] shadow-lg border-2 border-transparent hover:border-lumitel-blue transition-all">
                      <input type="text" value={pair.name} onChange={(e) => updatePairName(pair.id, e.target.value)} className="w-full text-lg md:text-2xl font-black text-lumitel-blue bg-transparent border-none focus:ring-0 uppercase italic truncate" />
                      <span className="text-[8px] md:text-[10px] bg-blue-50 text-lumitel-blue px-2 md:px-3 py-1 rounded-full font-black uppercase mt-1 inline-block">Cặp {g}{idx+1}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center"><button onClick={createGroupMatches} className="bg-lumitel-blue text-white px-14 py-7 rounded-[2rem] font-black text-2xl shadow-xl active:scale-95 transition-all uppercase italic">BẮT ĐẦU VÒNG BẢNG ➔</button></div>
          </div>
        )}

        {activeTab === 'group' && data && (
          <div className="space-y-8 md:space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <StandingTable title="BXH BẢNG A 🥇" standings={standingsA} />
              <StandingTable title="BXH BẢNG B 🥇" standings={standingsB} />
            </div>
            {['GROUP_A', 'GROUP_B'].map(st => (
              <div key={st} className="space-y-6 md:space-y-10">
                <h2 className="text-xl md:text-3xl font-black text-lumitel-blue border-b-4 border-lumitel-yellow inline-block pb-1 uppercase italic">{st === 'GROUP_A' ? 'LỊCH ĐẤU BẢNG A' : 'LỊCH ĐẤU BẢNG B'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {data.matches.filter(m => m.stage === st).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-center"><button onClick={generateKnockout} className="bg-lumitel-yellow text-lumitel-blue px-12 py-6 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 transition-all border-4 border-lumitel-blue uppercase italic">TIẾN VÀO BÁN KẾT ➔</button></div>
          </div>
        )}

        {activeTab === 'knockout' && data && (
          <div className="space-y-10 md:space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              <div className="space-y-8">
                <h3 className="text-xl md:text-3xl font-black text-lumitel-blue text-center uppercase italic border-b-4 border-gray-100 pb-4">⚡ BÁN KẾT</h3>
                {data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL).map(m => (
                  <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                ))}
                <div className="flex justify-center"><button onClick={generateFinals} className="bg-lumitel-blue text-white px-8 py-4 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all uppercase italic">XÁC NHẬN CHUNG KẾT ➔</button></div>
              </div>
              <div className="space-y-12">
                <div className="space-y-8">
                  <h3 className="text-xl md:text-3xl font-black text-lumitel-yellow bg-lumitel-blue p-5 rounded-[2rem] text-center uppercase italic shadow-xl border-4 border-lumitel-yellow">🏆 CHUNG KẾT</h3>
                  {data.matches.filter(m => m.stage === MatchStage.FINAL).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
                <div className="space-y-8 opacity-70">
                  <h3 className="text-lg md:text-2xl font-black text-gray-500 text-center uppercase italic">🥉 TRANH HẠNG 3</h3>
                  {data.matches.filter(m => m.stage === MatchStage.THIRD_PLACE).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && data && (
          <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border max-w-4xl mx-auto space-y-10">
            <h2 className="text-3xl md:text-5xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-6">⚙️ THỂ LỆ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['pointsToWinGroup', 'pointsToWinKnockout'].map(k => (
                <div key={k} className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-lumitel-yellow transition-all">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 italic">{k === 'pointsToWinGroup' ? 'Chạm Vòng Bảng' : 'Chạm Vòng Loại'}</label>
                  <input type="number" value={(data.config as any)[k]} onChange={(e) => updateConfig(k as any, parseInt(e.target.value))} className="w-full bg-white border-2 border-gray-100 rounded-3xl px-8 py-4 text-3xl font-black text-lumitel-blue outline-none" />
                </div>
              ))}
            </div>
            <div className="bg-lumitel-blue text-white p-8 rounded-[3rem] shadow-lg flex items-center justify-between">
               <h4 className="text-xl font-black uppercase italic text-lumitel-yellow">THẮNG CÁCH BIỆT (2 ĐIỂM)</h4>
               <button onClick={() => updateConfig('winByTwo', !data.config.winByTwo)} className={`px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 border-b-4 ${data.config.winByTwo ? 'bg-lumitel-yellow text-lumitel-blue border-yellow-600' : 'bg-white/20 text-white border-white/10'}`}>
                 {data.config.winByTwo ? 'BẬT' : 'TẮT'}
               </button>
            </div>
            <button onClick={resetTournament} className="w-full bg-red-50 text-red-500 py-6 rounded-3xl font-black uppercase italic border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all">⚠️ LÀM MỚI GIẢI ĐẤU</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-lumitel-blue text-white py-4 px-8 flex justify-between items-center z-40 border-t-4 border-lumitel-yellow shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-7 bg-lumitel-yellow rounded overflow-hidden shadow-inner flex items-center justify-center">
            <img src={LUMITEL_LOGO_SVG} alt="Lumitel Logo" className="w-full h-full object-contain" />
          </div>
          <div className="bg-lumitel-yellow text-lumitel-blue w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">10</div>
          <span className="font-black italic uppercase text-sm tracking-wider">Lumitel Burundi - 10 Years</span>
        </div>
        <div className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] text-right">Hội Bu Kiều Burundi</div>
      </footer>
    </div>
  );
};

export default App;
