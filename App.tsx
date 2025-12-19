
import React, { useState, useEffect } from 'react';
import { Player, Pair, Match, TournamentData, MatchStage, SetScore } from './types';
import { INITIAL_PLAYERS, LOGO_SVG, LUMITEL_LOGO_SVG } from './constants';
import { saveTournament, loadTournament, clearTournament } from './services/storageService';
import { calculateStandings } from './utils/rankings';
import MatchCard from './components/MatchCard';
import StandingTable from './components/StandingTable';

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
    if (saved && saved.config && saved.config.group) {
      setData(saved);
    } else {
      const initialData: TournamentData = {
        players: INITIAL_PLAYERS,
        pairs: [],
        matches: [],
        config: { 
          group: { matchFormat: 1, targetScore: 11, winByTwo: true },
          knockout: { matchFormat: 3, targetScore: 15, winByTwo: true },
          isLocked: false
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
    setData(prev => prev ? ({ ...prev, players: [...prev.players, newPlayer] }) : null);
  };

  const deleteAthlete = (id: string) => {
    if (!data) return;
    setData(prev => prev ? ({ ...prev, players: prev.players.filter(p => p.id !== id) }) : null);
    setConfirmDeleteId(null);
  };

  const updateAthleteName = (id: string, name: string) => {
    setData(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === id ? { ...p, name } : p) }) : null);
  };

  const updatePairName = (pairId: string, name: string) => {
    setData(prev => prev ? ({ ...prev, pairs: prev.pairs.map(p => p.id === pairId ? { ...p, name } : p) }) : null);
  };

  const updateStageConfig = (stage: 'group' | 'knockout', key: string, value: any) => {
    setData(prev => prev ? ({
      ...prev,
      config: {
        ...prev.config,
        [stage]: { ...prev.config[stage], [key]: value }
      }
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
    const shuffled = shuffleArray(data.players);
    const newPairs: Pair[] = [];
    const pairCount = Math.floor(shuffled.length / 2);
    for (let i = 0; i < pairCount; i++) {
      newPairs.push({
        id: `pair-${i}`,
        name: `${shuffled[i*2].name} & ${shuffled[i*2+1].name}`,
        playerIds: [shuffled[i*2].id, shuffled[i*2+1].id],
        groupId: i < Math.ceil(pairCount / 2) ? 'A' : 'B'
      });
    }
    setData(prev => ({ ...prev!, pairs: newPairs, matches: [] }));
  };

  const createGroupMatches = () => {
    if (!data) return;
    const groupA = data.pairs.filter(p => p.groupId === 'A');
    const groupB = data.pairs.filter(p => p.groupId === 'B');
    const cfg = data.config.group;

    const generateBalancedOrder = (pairs: Pair[], stage: MatchStage, label: string) => {
      const n = pairs.length;
      if (n < 2) return [];
      const teamCount = n % 2 === 0 ? n : n + 1;
      const rounds = teamCount - 1;
      const schedule: [number, number][] = [];
      const teams = Array.from({ length: teamCount }, (_, i) => i);
      for (let r = 0; r < rounds; r++) {
        for (let i = 0; i < teamCount / 2; i++) {
          const t1 = teams[i];
          const t2 = teams[teamCount - 1 - i];
          if (t1 < n && t2 < n) {
            schedule.push([t1, t2]);
          }
        }
        const last = teams.pop()!;
        teams.splice(1, 0, last);
      }
      return schedule.map(([i1, i2]) => ({
        id: `${stage}-${i1}-${i2}`, 
        stage, 
        pairAId: pairs[i1].id, 
        pairBId: pairs[i2].id,
        scoreA: null, scoreB: null, winnerId: null, isCompleted: false,
        label,
        targetScore: cfg.targetScore, matchFormat: cfg.matchFormat, winByTwo: cfg.winByTwo,
        sets: cfg.matchFormat === 3 ? [{a:0,b:0},{a:0,b:0},{a:0,b:0}] : [{a:0,b:0}]
      }));
    };

    const matchesA = generateBalancedOrder(groupA, MatchStage.GROUP_A, 'Bảng A');
    const matchesB = generateBalancedOrder(groupB, MatchStage.GROUP_B, 'Bảng B');
    const combinedMatches: Match[] = [];
    const maxLen = Math.max(matchesA.length, matchesB.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < matchesA.length) combinedMatches.push(matchesA[i]);
      if (i < matchesB.length) combinedMatches.push(matchesB[i]);
    }
    const finalMatches = combinedMatches.map((m, i) => ({
      ...m,
      label: `${m.stage === MatchStage.GROUP_A ? 'Bảng A' : 'Bảng B'}: Trận ${Math.floor(i/2) + 1}`
    }));

    setData({ ...data, matches: finalMatches });
    setActiveTab('group');
  };

  const updateMatchScore = (matchId: string, scoreA: number, scoreB: number, sets: SetScore[]) => {
    setData(prev => {
      if (!prev) return null;
      const newMatches = prev.matches.map(m => (m.id === matchId ? {
        ...m, scoreA, scoreB, sets, winnerId: scoreA > scoreB ? m.pairAId : m.pairBId, isCompleted: true
      } : m));
      const current = newMatches.find(m => m.id === matchId);
      if (current?.stage === MatchStage.FINAL && current.isCompleted) setShowCelebration(true);
      return { ...prev, matches: newMatches };
    });
  };

  const resetTournament = () => {
    if (!data) return;
    const hasScores = data.matches.some(m => m.isCompleted);
    if (hasScores) {
      alert("Giải đấu đã có kết quả ghi điểm, không thể làm mới giải đấu!");
      return;
    }
    if (window.confirm("Làm mới danh sách trận đấu dựa trên thể lệ hiện tại? (Vẫn giữ cặp đấu)")) {
      createGroupMatches();
      alert("Đã cập nhật lại danh sách trận đấu!");
    }
  };

  const lockRules = () => {
    if (!data) return;
    const hasScores = data.matches.some(m => m.isCompleted);
    if (!data.config.isLocked && !hasScores) {
      // Nếu đang mở và chưa có điểm, cho phép chốt và cập nhật lại trận đấu
      createGroupMatches();
      setData(prev => prev ? ({ ...prev, config: { ...prev.config, isLocked: true } }) : null);
    } else {
      setData(prev => prev ? ({ ...prev, config: { ...prev.config, isLocked: true } }) : null);
    }
  };

  const unlockRules = () => {
    if (!data) return;
    const hasScores = data.matches.some(m => m.isCompleted);
    if (hasScores) {
      alert("Đã có trận đấu ghi điểm, không thể sửa lại thể lệ!");
      return;
    }
    setData(prev => prev ? ({ ...prev, config: { ...prev.config, isLocked: false } }) : null);
  };

  const standingsA = calculateStandings(data?.pairs.filter(p => p.groupId === 'A') || [], data?.matches.filter(m => m.stage === MatchStage.GROUP_A) || []);
  const standingsB = calculateStandings(data?.pairs.filter(p => p.groupId === 'B') || [], data?.matches.filter(m => m.stage === MatchStage.GROUP_B) || []);

  const generateKnockout = () => {
    if (!data) return;
    const cfg = data.config.knockout;
    const sf1: Match = {
      id: 'sf-1', stage: MatchStage.SEMI_FINAL, pairAId: standingsA[0].pairId, pairBId: standingsB[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 1',
      targetScore: cfg.targetScore, matchFormat: cfg.matchFormat, winByTwo: cfg.winByTwo,
      sets: cfg.matchFormat === 3 ? [{a:0,b:0},{a:0,b:0},{a:0,b:0}] : [{a:0,b:0}]
    };
    const sf2: Match = {
      id: 'sf-2', stage: MatchStage.SEMI_FINAL, pairAId: standingsB[0].pairId, pairBId: standingsA[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 2',
      targetScore: cfg.targetScore, matchFormat: cfg.matchFormat, winByTwo: cfg.winByTwo,
      sets: cfg.matchFormat === 3 ? [{a:0,b:0},{a:0,b:0},{a:0,b:0}] : [{a:0,b:0}]
    };
    setData({ ...data, matches: [...data.matches.filter(m => m.stage.startsWith('GROUP')), sf1, sf2] });
    setActiveTab('knockout');
  };

  const generateFinals = () => {
    if (!data) return;
    const sf = data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL);
    const m1 = sf[0]; const m2 = sf[1];
    const cfg = data.config.knockout;
    const winners = [m1.winnerId!, m2.winnerId!];
    const losers = [m1.winnerId === m1.pairAId ? m1.pairBId : m1.pairAId, m2.winnerId === m2.pairAId ? m2.pairBId : m2.pairAId];

    const final: Match = { id: 'm-final', stage: MatchStage.FINAL, pairAId: winners[0], pairBId: winners[1], scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Chung Kết', targetScore: cfg.targetScore, matchFormat: cfg.matchFormat, winByTwo: cfg.winByTwo, sets: cfg.matchFormat === 3 ? [{a:0,b:0},{a:0,b:0},{a:0,b:0}] : [{a:0,b:0}] };
    const third: Match = { id: 'm-third', stage: MatchStage.THIRD_PLACE, pairAId: losers[0], pairBId: losers[1], scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Tranh Hạng 3', targetScore: cfg.targetScore, matchFormat: cfg.matchFormat, winByTwo: cfg.winByTwo, sets: cfg.matchFormat === 3 ? [{a:0,b:0},{a:0,b:0},{a:0,b:0}] : [{a:0,b:0}] };
    setData({ ...data, matches: [...data.matches.filter(m => m.stage !== MatchStage.FINAL && m.stage !== MatchStage.THIRD_PLACE), third, final] });
  };

  const winnerName = data?.pairs.find(p => p.id === data.matches.find(m => m.stage === MatchStage.FINAL)?.winnerId)?.name || "...";
  const hasStarted = data?.matches.some(m => m.isCompleted) || false;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 selection:bg-lumitel-yellow selection:text-lumitel-blue">
      {showCelebration && <Confetti onClose={() => setShowCelebration(false)} winnerName={winnerName} />}

      <header className="bg-lumitel-blue text-white overflow-hidden relative shadow-2xl border-b-[4px] md:border-b-[6px] border-lumitel-yellow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
               <div className="w-24 h-10 bg-lumitel-yellow rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                  <img src={LUMITEL_LOGO_SVG} alt="Lumitel" className="h-6 w-auto object-contain" />
               </div>
               <div className="inline-block bg-lumitel-blue border border-lumitel-yellow/50 px-3 py-1 rounded-xl transform -rotate-2 shadow-sm">
                 <span className="text-lumitel-yellow font-black tracking-widest uppercase italic text-[10px] md:text-sm">Hội Bu Kiều Burundi Presents</span>
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
      </header>

      <nav className="bg-white/90 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-2 py-2 flex justify-start md:justify-center space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'athletes', label: 'VĐV', icon: '👤' },
            { id: 'pairs', label: 'CẶP', icon: '👥' },
            { id: 'group', label: 'VÒNG BẢNG', icon: '📊' },
            { id: 'knockout', label: 'VÒNG LOẠI', icon: '🏆' },
            { id: 'rules', label: 'THỂ LỆ', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs md:text-sm font-black transition-all whitespace-nowrap rounded-xl flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-lumitel-blue text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
              } uppercase italic`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-3 md:p-10">
        {activeTab === 'athletes' && data && (
          <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl border">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-3">📝 QUẢN LÝ VĐV</h2>
              <button onClick={addAthlete} className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm uppercase">+ Thêm VĐV</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.players.map((p, i) => (
                <div key={p.id} className="group flex items-center bg-gray-50 p-4 rounded-xl border-2 border-transparent hover:border-lumitel-yellow transition-all">
                  <div className="w-8 h-8 bg-lumitel-blue text-white rounded-lg flex items-center justify-center font-black mr-3">{i+1}</div>
                  <input value={p.name} onChange={e => updateAthleteName(p.id, e.target.value)} className="bg-transparent border-none focus:ring-0 font-black text-gray-900 text-xs uppercase truncate" />
                  <button onClick={() => deleteAthlete(p.id)} className="ml-auto text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-center"><button onClick={() => setActiveTab('pairs')} className="bg-lumitel-blue text-white px-14 py-6 rounded-[2rem] font-black text-2xl shadow-xl uppercase italic">TIẾP TỤC ➔</button></div>
          </div>
        )}

        {activeTab === 'pairs' && data && (
          <div className="space-y-6 md:space-y-12">
            <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl flex justify-between items-center border">
              <h3 className="text-xl md:text-3xl font-black text-lumitel-blue uppercase italic">SẮP XẾP CẶP ĐẤU 👥</h3>
              <button onClick={generateRandomPairs} className="bg-lumitel-yellow text-lumitel-blue px-8 py-4 rounded-[1.5rem] font-black shadow-md uppercase italic">BỐC THĂM LẠI</button>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {['A', 'B'].map(g => (
                <div key={g} className="space-y-6">
                  <h4 className="text-lg md:text-2xl font-black text-lumitel-blue px-2 uppercase italic">BẢNG {g}</h4>
                  {data.pairs.filter(p => p.groupId === g).map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-lumitel-blue transition-all">
                      <input value={p.name} onChange={e => updatePairName(p.id, e.target.value)} className="w-full text-lg font-black text-lumitel-blue bg-transparent border-none outline-none uppercase italic" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center"><button onClick={createGroupMatches} className="bg-lumitel-blue text-white px-14 py-7 rounded-[2rem] font-black text-2xl shadow-xl uppercase italic">BẮT ĐẦU VÒNG BẢNG ➔</button></div>
          </div>
        )}

        {activeTab === 'group' && data && (
          <div className="space-y-16">
            <div className="grid lg:grid-cols-2 gap-10">
              <StandingTable title="BXH BẢNG A 🥇" standings={standingsA} />
              <StandingTable title="BXH BẢNG B 🥇" standings={standingsB} />
            </div>
            {['GROUP_A', 'GROUP_B'].map(st => (
              <div key={st} className="space-y-10">
                <h2 className="text-xl md:text-3xl font-black text-lumitel-blue border-b-4 border-lumitel-yellow inline-block uppercase italic">{st.replace('_', ' ')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.matches.filter(m => m.stage === st).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-center"><button onClick={generateKnockout} className="bg-lumitel-yellow text-lumitel-blue px-12 py-6 rounded-[2rem] font-black text-2xl border-4 border-lumitel-blue shadow-xl uppercase italic">TIẾN VÀO BÁN KẾT ➔</button></div>
          </div>
        )}

        {activeTab === 'knockout' && data && (
          <div className="grid md:grid-cols-2 gap-14">
            <div className="space-y-8">
              <h3 className="text-xl md:text-3xl font-black text-lumitel-blue text-center uppercase italic border-b-4 border-gray-100 pb-4">⚡ BÁN KẾT</h3>
              {data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL).map(m => (
                <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
              ))}
              <div className="flex justify-center"><button onClick={generateFinals} className="bg-lumitel-blue text-white px-8 py-4 rounded-xl font-black shadow-xl uppercase italic">XÁC NHẬN CHUNG KẾT ➔</button></div>
            </div>
            <div className="space-y-12">
              <h3 className="text-xl md:text-3xl font-black text-lumitel-yellow bg-lumitel-blue p-5 rounded-[2rem] text-center uppercase italic shadow-xl border-4 border-lumitel-yellow">🏆 CHUNG KẾT</h3>
              {data.matches.filter(m => m.stage === MatchStage.FINAL).map(m => (
                <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
              ))}
              <h3 className="text-lg md:text-2xl font-black text-gray-500 text-center uppercase italic opacity-70">🥉 TRANH HẠNG 3</h3>
              {data.matches.filter(m => m.stage === MatchStage.THIRD_PLACE).map(m => (
                <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && data && (
          <div className="bg-white p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] shadow-2xl border max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-6">
               <h2 className="text-2xl md:text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter">⚙️ THỂ LỆ THI ĐẤU</h2>
               {data.config.isLocked ? (
                 <button 
                   onClick={unlockRules} 
                   disabled={hasStarted}
                   className={`px-6 py-2 rounded-xl font-black text-xs uppercase italic transition-all ${hasStarted ? 'bg-gray-100 text-gray-300' : 'bg-lumitel-yellow text-lumitel-blue shadow-md hover:scale-105'}`}
                 >
                   {hasStarted ? 'KHÔNG THỂ SỬA' : 'SỬA THỂ LỆ'}
                 </button>
               ) : (
                 <button 
                   onClick={lockRules} 
                   className="bg-lumitel-blue text-white px-8 py-2 rounded-xl font-black text-xs uppercase italic shadow-md hover:scale-105 active:scale-95"
                 >
                   CHỐT THỂ LỆ
                 </button>
               )}
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {['group', 'knockout'].map(s => (
                <div key={s} className={`p-8 rounded-[3rem] space-y-6 border transition-all ${data.config.isLocked ? 'bg-gray-50/50 border-gray-100 opacity-80' : 'bg-white border-lumitel-blue/20 shadow-lg'}`}>
                  <h3 className="text-xl font-black text-lumitel-blue uppercase italic border-b pb-2">{s === 'group' ? 'Vòng Bảng' : 'Vòng Loại Trực Tiếp'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase italic">Số trận (Định dạng)</label>
                      <select 
                        disabled={data.config.isLocked}
                        value={data.config[s as 'group' | 'knockout'].matchFormat} 
                        onChange={e => updateStageConfig(s as any, 'matchFormat', parseInt(e.target.value))}
                        className={`w-full p-4 rounded-2xl font-black mt-1 text-lumitel-blue border outline-none ${data.config.isLocked ? 'bg-transparent border-transparent' : 'bg-white border-gray-200 focus:border-lumitel-blue'}`}
                      >
                        <option value={1}>1 SET DUY NHẤT</option>
                        <option value={3}>BEST OF 3 (THẮNG 2/3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase italic">Điểm chạm</label>
                      <input 
                        disabled={data.config.isLocked}
                        type="number" 
                        value={data.config[s as 'group' | 'knockout'].targetScore} 
                        onChange={e => updateStageConfig(s as any, 'targetScore', parseInt(e.target.value))}
                        className={`w-full p-4 rounded-2xl font-black mt-1 text-2xl text-lumitel-blue border outline-none ${data.config.isLocked ? 'bg-transparent border-transparent' : 'bg-white border-gray-200 focus:border-lumitel-blue'}`} 
                      />
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${data.config.isLocked ? 'bg-transparent border-transparent' : 'bg-white border-gray-200'}`}>
                      <span className="font-black text-xs uppercase italic">Thắng cách 2</span>
                      <button 
                        disabled={data.config.isLocked}
                        onClick={() => updateStageConfig(s as any, 'winByTwo', !data.config[s as 'group' | 'knockout'].winByTwo)}
                        className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${data.config[s as 'group' | 'knockout'].winByTwo ? 'bg-lumitel-yellow text-lumitel-blue' : 'bg-gray-200 text-gray-400 opacity-50'}`}
                      >
                        {data.config[s as 'group' | 'knockout'].winByTwo ? 'BẬT' : 'TẬT'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex flex-col gap-4">
               {!data.config.isLocked && (
                 <button 
                   onClick={lockRules}
                   className="w-full bg-lumitel-blue text-white py-6 rounded-3xl font-black uppercase italic shadow-xl hover:bg-blue-800 transition-all text-xl"
                 >
                   💾 LƯU THỂ LỆ
                 </button>
               )}
               <button 
                 onClick={resetTournament} 
                 className="w-full bg-[#FF4D4D] text-white py-6 rounded-3xl font-black uppercase italic shadow-lg hover:bg-red-600 transition-all text-xl active:scale-95 border-b-8 border-red-800"
               >
                 ⚠️ LÀM MỚI GIẢI ĐẤU
               </button>
               <p className="text-center text-[10px] text-gray-400 font-black uppercase italic">
                 {hasStarted ? "Giải đấu đang diễn ra - Thể lệ đã được chốt." : "Có thể thay đổi thể lệ trước khi trận đấu đầu tiên kết thúc."}
               </p>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-lumitel-blue text-white py-4 px-8 flex justify-between items-center z-40 border-t-4 border-lumitel-yellow shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-6 bg-lumitel-yellow p-1 rounded flex items-center justify-center">
            <img src={LUMITEL_LOGO_SVG} alt="Lumitel" className="h-full w-auto" />
          </div>
          <div className="bg-lumitel-yellow text-lumitel-blue w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg">10</div>
          <span className="font-black italic uppercase text-sm tracking-wider">Lumitel Burundi - 10 Years</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
