import React, { useState, useEffect } from 'react';
import { Player, Pair, Match, TournamentData, MatchStage } from './types';
import { INITIAL_PLAYERS, LOGO_SVG } from './constants';
import { saveTournament, loadTournament, clearTournament } from './services/storageService';
import { calculateStandings } from './utils/rankings';
import MatchCard from './components/MatchCard';
import StandingTable from './components/StandingTable';

// Hiệu ứng pháo hoa rực rỡ hơn
const Confetti = ({ onClose }: { onClose: () => void }) => {
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
         <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border-[12px] border-lumitel-yellow text-center transform scale-110 animate-bounce">
            <div className="text-7xl md:text-9xl mb-6">🏆</div>
            <h2 className="text-4xl md:text-8xl font-black text-lumitel-blue mb-4 italic uppercase tracking-tighter leading-none">NHÀ VÔ ĐỊCH!</h2>
            <p className="text-lg md:text-3xl font-bold text-gray-500 uppercase tracking-[0.3em] mb-10">KỶ NIỆM 10 NĂM LUMITEL</p>
            <button 
              onClick={onClose}
              className="bg-lumitel-blue text-white px-10 py-4 rounded-full font-black hover:scale-110 transition-transform pointer-events-auto shadow-xl text-xl uppercase italic"
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
    
    // Logic tạo trận đấu vòng tròn (Round Robin) cho từng bảng
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

      // Kiểm tra nếu là trận chung kết được cập nhật xong
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

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 selection:bg-lumitel-yellow selection:text-lumitel-blue">
      {showCelebration && <Confetti onClose={() => setShowCelebration(false)} />}

      {/* 🚀 RESPONSIVE HEADER */}
      <header className="bg-lumitel-blue text-white overflow-hidden relative shadow-2xl border-b-[4px] md:border-b-[6px] border-lumitel-yellow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 relative z-10">
          
          <div className="text-center lg:text-left flex-1">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl mb-4 transform -rotate-2">
              <span className="text-lumitel-yellow font-black tracking-widest uppercase italic text-[10px] md:text-sm">Hội Bu Kiều Burundi Presents</span>
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
              <img 
                src={LOGO_SVG}
                alt="Logo Hội Bu Kiều"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-lumitel-yellow/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
      </header>

      {/* MOBILE-FRIENDLY NAV */}
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
        
        {/* ATHLETE TAB */}
        {activeTab === 'athletes' && data && (
          <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl md:shadow-2xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-3 md:gap-4">
              <h2 className="text-2xl md:text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-3">
                <span className="bg-lumitel-yellow p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg text-lg md:text-2xl">📝</span> QUẢN LÝ VĐV
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={addAthlete}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow-md hover:bg-green-600 active:scale-95 transition-all"
                >
                  + THÊM VĐV
                </button>
                <p className="text-[10px] md:text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-lg">Nhấn vào tên để sửa</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {data.players.map((player, idx) => (
                <div key={player.id} className="group flex items-center bg-gray-50 p-4 rounded-xl md:rounded-[1.5rem] border-2 border-transparent hover:border-lumitel-yellow hover:bg-white transition-all duration-300 relative">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-lumitel-blue text-white rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-base shrink-0 shadow-md mr-3 md:mr-4">
                    {idx + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">VĐV</label>
                    <input 
                      type="text" 
                      value={player.name}
                      onChange={(e) => updateAthleteName(player.id, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-black text-gray-900 text-sm md:text-lg placeholder-gray-300 uppercase italic tracking-tighter truncate"
                    />
                  </div>
                  
                  {/* Delete Button UI */}
                  {confirmDeleteId === player.id ? (
                    <div className="flex gap-1 animate-in slide-in-from-right duration-200">
                      <button 
                        onClick={() => deleteAthlete(player.id)}
                        className="bg-red-500 text-white text-[8px] px-2 py-1 rounded font-black shadow-sm"
                      >
                        XÓA
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-gray-200 text-gray-600 text-[8px] px-2 py-1 rounded font-black shadow-sm"
                      >
                        HUỶ
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(player.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 active:scale-90"
                      title="Xoá VĐV"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-16 flex justify-center">
              <button 
                onClick={() => setActiveTab('pairs')}
                className="w-full md:w-auto bg-lumitel-blue text-white px-8 md:px-14 py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-base md:text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase italic"
              >
                TIẾP TỤC ➔
              </button>
            </div>
          </div>
        )}

        {/* PAIRS TAB */}
        {activeTab === 'pairs' && data && (
          <div className="space-y-6 md:space-y-12">
            <div className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl md:shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 text-center md:text-left">
              <div>
                <h3 className="text-xl md:text-3xl font-black text-lumitel-blue uppercase italic">SẮP XẾP CẶP ĐẤU 👥</h3>
                <p className="text-gray-500 font-bold text-xs md:text-lg">Bốc thăm ngẫu nhiên {data.players.length / 2} cặp đấu</p>
              </div>
              <button onClick={generateRandomPairs} className="w-full md:w-auto bg-lumitel-yellow text-lumitel-blue px-6 py-3 md:px-8 md:py-5 rounded-xl md:rounded-[1.5rem] font-black shadow-[0_5px_0_#CCB500] hover:translate-y-1 transition-all uppercase italic text-sm md:text-base">🔄 BỐC THĂM LẠI</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-lg md:text-2xl font-black text-lumitel-blue flex items-center gap-3 px-2 uppercase italic">BẢNG A</h4>
                {data.pairs.filter(p => p.groupId === 'A').map((pair, idx) => (
                   <div key={pair.id} className="bg-white p-5 md:p-8 rounded-xl md:rounded-[2rem] shadow-lg border-2 border-transparent hover:border-lumitel-blue">
                      <input type="text" value={pair.name} onChange={(e) => updatePairName(pair.id, e.target.value)} className="w-full text-lg md:text-2xl font-black text-lumitel-blue bg-transparent border-none focus:ring-0 uppercase italic tracking-tighter truncate" />
                      <span className="text-[8px] md:text-[10px] bg-blue-50 text-lumitel-blue px-2 md:px-3 py-1 rounded-full font-black uppercase mt-1 inline-block">Cặp số A{idx+1}</span>
                   </div>
                ))}
              </div>
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-lg md:text-2xl font-black text-lumitel-blue flex items-center gap-3 px-2 uppercase italic">BẢNG B</h4>
                {data.pairs.filter(p => p.groupId === 'B').map((pair, idx) => (
                   <div key={pair.id} className="bg-white p-5 md:p-8 rounded-xl md:rounded-[2rem] shadow-lg border-2 border-transparent hover:border-lumitel-blue">
                      <input type="text" value={pair.name} onChange={(e) => updatePairName(pair.id, e.target.value)} className="w-full text-lg md:text-2xl font-black text-lumitel-blue bg-transparent border-none focus:ring-0 uppercase italic tracking-tighter truncate" />
                      <span className="text-[8px] md:text-[10px] bg-blue-50 text-lumitel-blue px-2 md:px-3 py-1 rounded-full font-black uppercase mt-1 inline-block">Cặp số B{idx+1}</span>
                   </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><button onClick={createGroupMatches} className="w-full md:w-auto bg-lumitel-blue text-white px-8 md:px-14 py-4 md:py-7 rounded-xl md:rounded-[2rem] font-black text-base md:text-2xl shadow-xl hover:bg-blue-800 transition-all uppercase italic">BẮT ĐẦU VÒNG BẢNG ➔</button></div>
          </div>
        )}

        {/* GROUP TAB */}
        {activeTab === 'group' && data && data.matches.length > 0 && (
          <div className="space-y-8 md:space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <StandingTable title="BXH BẢNG A 🥇" standings={standingsA} />
              <StandingTable title="BXH BẢNG B 🥇" standings={standingsB} />
            </div>
            
            <div className="space-y-8 md:space-y-16">
              <div className="space-y-6 md:space-y-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-lumitel-yellow rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-lg">📅</div>
                   <h2 className="text-xl md:text-3xl font-black text-lumitel-blue border-b-4 md:border-b-8 border-lumitel-yellow inline-block pb-1 md:pb-2 uppercase italic">LỊCH THI ĐẤU BẢNG A</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {data.matches.filter(m => m.stage === MatchStage.GROUP_A).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>

              <div className="space-y-6 md:space-y-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-lumitel-yellow rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-lg">📅</div>
                   <h2 className="text-xl md:text-3xl font-black text-lumitel-blue border-b-4 md:border-b-8 border-lumitel-yellow inline-block pb-1 md:pb-2 uppercase italic">LỊCH THI ĐẤU BẢNG B</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {data.matches.filter(m => m.stage === MatchStage.GROUP_B).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8"><button onClick={generateKnockout} className="w-full md:w-auto bg-lumitel-yellow text-lumitel-blue px-8 md:px-12 py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-lg md:text-2xl shadow-xl hover:scale-105 transition-all border-4 border-lumitel-blue uppercase italic">TIẾN VÀO BÁN KẾT ➔</button></div>
          </div>
        )}

        {/* KNOCKOUT TAB */}
        {activeTab === 'knockout' && data && data.matches.length > 0 && (
          <div className="space-y-10 md:space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-xl md:text-3xl font-black text-lumitel-blue text-center uppercase italic border-b-4 border-gray-100 pb-3 md:pb-4">⚡ BÁN KẾT</h3>
                <div className="grid gap-4 md:gap-8">
                  {data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
                <div className="flex justify-center"><button onClick={generateFinals} className="w-full md:w-auto bg-lumitel-blue text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-xl hover:bg-blue-800 transition-all uppercase italic text-sm md:text-base">XÁC NHẬN CHUNG KẾT ➔</button></div>
              </div>
              <div className="space-y-8 md:space-y-12">
                <div className="space-y-6 md:space-y-8">
                  <h3 className="text-xl md:text-3xl font-black text-lumitel-yellow bg-lumitel-blue p-4 md:p-5 rounded-2xl md:rounded-3xl text-center uppercase italic shadow-xl border-4 border-lumitel-yellow">🏆 CHUNG KẾT</h3>
                  {data.matches.filter(m => m.stage === MatchStage.FINAL).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
                <div className="space-y-6 md:space-y-8 opacity-70">
                  <h3 className="text-lg md:text-2xl font-black text-gray-500 text-center uppercase italic">🥉 TRANH HẠNG 3</h3>
                  {data.matches.filter(m => m.stage === MatchStage.THIRD_PLACE).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && data && (
          <div className="bg-white p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] shadow-xl md:shadow-2xl border border-gray-100 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="bg-lumitel-yellow p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-lg">
                <span className="text-2xl md:text-4xl">⚙️</span>
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-lumitel-blue uppercase italic tracking-tighter leading-tight">CẤU HÌNH THỂ LỆ</h2>
            </div>
            
            <div className="space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-gray-50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border-2 border-transparent hover:border-lumitel-yellow transition-all">
                  <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Điểm chạm Vòng Bảng</label>
                  <div className="flex items-center gap-3 md:gap-4">
                    <input 
                      type="number" 
                      value={data.config.pointsToWinGroup}
                      onChange={(e) => updateConfig('pointsToWinGroup', parseInt(e.target.value))}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-xl md:text-3xl font-black text-lumitel-blue focus:ring-4 focus:ring-lumitel-yellow outline-none transition-all"
                    />
                    <span className="text-lg md:text-2xl font-black text-gray-300">PTS</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border-2 border-transparent hover:border-lumitel-yellow transition-all">
                  <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Điểm chạm Vòng Loại</label>
                  <div className="flex items-center gap-3 md:gap-4">
                    <input 
                      type="number" 
                      value={data.config.pointsToWinKnockout}
                      onChange={(e) => updateConfig('pointsToWinKnockout', parseInt(e.target.value))}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-xl md:text-3xl font-black text-lumitel-blue focus:ring-4 focus:ring-lumitel-yellow outline-none transition-all"
                    />
                    <span className="text-lg md:text-2xl font-black text-gray-300">PTS</span>
                  </div>
                </div>
              </div>

              <div className="bg-lumitel-blue text-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-white/20">⚖️</div>
                   <div>
                      <h4 className="text-base md:text-xl font-black uppercase italic text-lumitel-yellow">Thắng cách biệt</h4>
                      <p className="text-[10px] md:text-sm font-bold opacity-70">Chênh lệch tối thiểu 2 điểm</p>
                   </div>
                </div>
                <button 
                  onClick={() => updateConfig('winByTwo', !data.config.winByTwo)}
                  className={`w-full md:w-auto px-8 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-xl transition-all shadow-lg active:scale-95 border-b-4 ${
                    data.config.winByTwo 
                    ? 'bg-lumitel-yellow text-lumitel-blue border-yellow-600' 
                    : 'bg-white/20 text-white border-white/10 hover:bg-white/30'
                  }`}
                >
                  {data.config.winByTwo ? 'BẬT (ON)' : 'TẮT (OFF)'}
                </button>
              </div>

              <div className="mt-10 md:mt-16 flex flex-col items-center gap-4">
                 <button 
                   onClick={resetTournament}
                   className="w-full bg-red-50 text-red-500 px-6 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                 >
                   ⚠️ LÀM MỚI GIẢI ĐẤU
                 </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-lumitel-blue text-white py-2 md:py-4 px-4 md:px-8 flex justify-between items-center z-40 border-t-2 md:border-t-4 border-lumitel-yellow shadow-2xl">
        <div className="flex items-center gap-2 md:gap-4"><div className="bg-lumitel-yellow text-lumitel-blue w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-base">10</div><span className="font-black italic uppercase text-[8px] md:text-sm">Lumitel Burundi - 10 Years</span></div>
        <div className="text-[7px] md:text-[10px] font-black opacity-50 uppercase tracking-widest text-right">Hội Bu Kiều Burundi</div>
      </footer>
    </div>
  );
};

export default App;