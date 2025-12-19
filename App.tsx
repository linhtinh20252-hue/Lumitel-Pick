
import React, { useState, useEffect } from 'react';
import { Player, Pair, Match, TournamentData, MatchStage } from './types';
import { INITIAL_PLAYERS, GROUP_MATCH_TEMPLATE, LOGO_BASE64 } from './constants';
import { saveTournament, loadTournament, clearTournament } from './services/storageService';
import { calculateStandings } from './utils/rankings';
import MatchCard from './components/MatchCard';
import StandingTable from './components/StandingTable';

const App: React.FC = () => {
  const [data, setData] = useState<TournamentData | null>(null);
  const [activeTab, setActiveTab] = useState<'athletes' | 'pairs' | 'group' | 'knockout' | 'rules'>('athletes');

  // Khởi tạo dữ liệu
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
      
      // Mặc định tạo cặp ngẫu nhiên lần đầu
      const shuffledPlayers = [...INITIAL_PLAYERS].sort(() => Math.random() - 0.5);
      const initialPairs: Pair[] = [];
      for (let i = 0; i < 8; i++) {
        initialPairs.push({
          id: `pair-${i}`,
          name: `${shuffledPlayers[i*2].name} & ${shuffledPlayers[i*2+1].name}`,
          playerIds: [shuffledPlayers[i*2].id, shuffledPlayers[i*2+1].id],
          groupId: i < 4 ? 'A' : 'B'
        });
      }
      setData({ ...initialData, pairs: initialPairs });
    }
  }, []);

  // Lưu dữ liệu khi có thay đổi
  useEffect(() => {
    if (data) saveTournament(data);
  }, [data]);

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
    const shuffledPlayers = shuffleArray(data.players);
    const newPairs: Pair[] = [];
    for (let i = 0; i < 8; i++) {
      const p1 = shuffledPlayers[i * 2];
      const p2 = shuffledPlayers[i * 2 + 1];
      newPairs.push({
        id: `pair-${i}`,
        name: `${p1.name} & ${p2.name}`,
        playerIds: [p1.id, p2.id],
        groupId: i < 4 ? 'A' : 'B'
      });
    }
    setData(prev => ({ ...prev!, pairs: newPairs, matches: [] }));
  };

  const createGroupMatches = () => {
    if (!data) return;
    const groupA = data.pairs.filter(p => p.groupId === 'A');
    const groupB = data.pairs.filter(p => p.groupId === 'B');
    if (groupA.length < 4 || groupB.length < 4) return;

    const matches: Match[] = [];
    GROUP_MATCH_TEMPLATE.forEach((t, i) => {
      matches.push({
        id: `ga-${i}`,
        stage: MatchStage.GROUP_A,
        pairAId: groupA[t.p1].id,
        pairBId: groupA[t.p2].id,
        scoreA: null, scoreB: null, winnerId: null, isCompleted: false,
        label: `Bảng A: Trận ${i + 1}`,
        targetScore: data.config.pointsToWinGroup
      });
      matches.push({
        id: `gb-${i}`,
        stage: MatchStage.GROUP_B,
        pairAId: groupB[t.p1].id,
        pairBId: groupB[t.p2].id,
        scoreA: null, scoreB: null, winnerId: null, isCompleted: false,
        label: `Bảng B: Trận ${i + 1}`,
        targetScore: data.config.pointsToWinGroup
      });
    });
    setData({ ...data, matches });
    setActiveTab('group');
  };

  const updateMatchScore = (matchId: string, scoreA: number, scoreB: number) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        matches: prev.matches.map(m => (m.id === matchId ? {
          ...m, scoreA, scoreB, winnerId: scoreA > scoreB ? m.pairAId : m.pairBId, isCompleted: true
        } : m))
      };
    });
  };

  const resetTournament = () => {
    if (confirm("Bạn có chắc chắn muốn xoá toàn bộ dữ liệu và bắt đầu lại từ đầu?")) {
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
    if (standingsA.length < 2 || standingsB.length < 2) return;
    const sf1: Match = {
      id: 'sf-1', stage: MatchStage.SEMI_FINAL, pairAId: standingsA[0].pairId, pairBId: standingsB[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 1 (Nhất A vs Nhì B)',
      targetScore: data.config.pointsToWinKnockout
    };
    const sf2: Match = {
      id: 'sf-2', stage: MatchStage.SEMI_FINAL, pairAId: standingsB[0].pairId, pairBId: standingsA[1].pairId,
      scoreA: null, scoreB: null, winnerId: null, isCompleted: false, label: 'Bán Kết 2 (Nhất B vs Nhì A)',
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
    <div className="min-h-screen pb-24 bg-gray-50 text-gray-900 selection:bg-lumitel-yellow selection:text-lumitel-blue">
      {/* HEADER SECTION - NEW REDESIGN */}
      <header className="bg-lumitel-blue text-white overflow-hidden relative shadow-2xl border-b-[6px] border-lumitel-yellow">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Brand & Title */}
          <div className="z-10 text-center lg:text-left flex-1">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl mb-6 transform -rotate-2">
              <span className="text-lumitel-yellow font-black tracking-widest uppercase italic text-sm">Hội Bu Kiều Burundi Presents</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none tracking-tighter uppercase italic drop-shadow-2xl">
              KỶ NIỆM <span className="text-lumitel-yellow">10 NĂM</span> <br/>LUMITEL BURUNDI
            </h1>
            <p className="text-xl md:text-2xl font-bold opacity-90 italic max-w-2xl">
              Giải Pickleball Open 2025 - Chào mừng chặng đường 10 năm phát triển bền vững tại Burundi.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <div className="bg-lumitel-yellow text-lumitel-blue px-6 py-3 rounded-2xl font-black shadow-[0_10px_0_#CCB500] hover:translate-y-1 hover:shadow-[0_5px_0_#CCB500] transition-all">HÀ NỘI 03/2025</div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-black shadow-lg">16 VẬN ĐỘNG VIÊN 🎾</div>
            </div>
          </div>

          {/* Logo Container */}
          <div className="relative z-10 w-full lg:w-auto flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-[3rem] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-4 border-lumitel-yellow transform rotate-3 hover:rotate-0 transition-all duration-700 flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {/* LOGO IMAGE LOADED FROM BASE64 */}
              <img 
                src={`data:image/png;base64,${LOGO_BASE64}`}
                alt="Logo Hội Bu Kiều"
                className="w-full h-full object-contain p-2"
              />
            </div>
            {/* Decorations */}
            <div className="absolute -top-6 -right-6 text-7xl animate-bounce drop-shadow-2xl">🎾</div>
            <div className="absolute -bottom-6 -left-6 text-6xl animate-pulse drop-shadow-2xl opacity-70">🏸</div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-lumitel-yellow/10 rounded-full -ml-36 -mb-36 blur-3xl"></div>
      </header>

      {/* STICKY NAV */}
      <nav className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-center space-x-2 md:space-x-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'athletes', label: 'Danh Sách VĐV', icon: '👤' },
            { id: 'pairs', label: 'Cặp Thi Đấu', icon: '👥' },
            { id: 'group', label: 'Vòng Bảng', icon: '📊' },
            { id: 'knockout', label: 'Vòng Loại', icon: '🏆' },
            { id: 'rules', label: 'Thể Lệ', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-black transition-all whitespace-nowrap rounded-2xl flex items-center gap-2 ${
                activeTab === tab.id 
                ? 'bg-lumitel-blue text-white shadow-xl scale-105' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        
        {/* ATHLETE EDITING TAB */}
        {activeTab === 'athletes' && data && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <h2 className="text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-4">
                <span className="bg-lumitel-yellow p-3 rounded-2xl shadow-lg">📝</span> HIỆU CHỈNH DANH SÁCH VĐV
              </h2>
              <p className="text-gray-500 font-bold bg-gray-100 px-4 py-2 rounded-xl">Nhấn vào tên để sửa đổi</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.players.map((player, idx) => (
                <div key={player.id} className="group relative flex items-center bg-gray-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-lumitel-yellow hover:bg-white hover:shadow-2xl transition-all duration-300">
                  <div className="w-12 h-12 bg-lumitel-blue text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-110 transition-transform shadow-lg mr-6">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tên Vận Động Viên</label>
                    <input 
                      type="text" 
                      value={player.name}
                      onChange={(e) => updateAthleteName(player.id, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-black text-gray-900 text-2xl placeholder-gray-300 uppercase italic tracking-tighter"
                      placeholder="Nhập tên..."
                    />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-lumitel-yellow text-2xl">🖋️</div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => setActiveTab('pairs')}
                className="bg-lumitel-blue text-white px-14 py-6 rounded-[2rem] font-black text-2xl shadow-[0_20px_40px_rgba(0,86,150,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 uppercase italic"
              >
                TIẾP TỤC: XẾP CẶP ĐẤU ➔
              </button>
            </div>
          </div>
        )}

        {/* PAIRS MANAGEMENT */}
        {activeTab === 'pairs' && data && (
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl font-black text-lumitel-blue uppercase italic">SẮP XẾP CẶP ĐẤU 👥</h3>
                <p className="text-gray-500 font-bold text-lg">Hệ thống sẽ bốc thăm ngẫu nhiên 8 cặp từ 16 VĐV</p>
              </div>
              <button 
                onClick={generateRandomPairs}
                className="bg-lumitel-yellow text-lumitel-blue px-8 py-5 rounded-[1.5rem] font-black text-xl shadow-[0_8px_0_#CCB500] hover:translate-y-1 hover:shadow-[0_4px_0_#CCB500] transition-all flex items-center gap-3 uppercase italic"
              >
                🔄 BỐC THĂM LẠI NGẪU NHIÊN
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-2xl font-black text-lumitel-blue flex items-center gap-3 px-4 uppercase italic"><span className="w-4 h-4 bg-lumitel-yellow rounded-full"></span> BẢNG A</h4>
                {data.pairs.filter(p => p.groupId === 'A').map((pair, idx) => (
                   <div key={pair.id} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-transparent hover:border-lumitel-blue transition-all group">
                      <input
                        type="text"
                        value={pair.name}
                        onChange={(e) => updatePairName(pair.id, e.target.value)}
                        className="w-full text-2xl font-black text-lumitel-blue bg-transparent border-none focus:ring-0 uppercase italic tracking-tighter"
                      />
                      <div className="mt-4 flex gap-2">
                        <span className="text-[10px] bg-blue-50 text-lumitel-blue px-3 py-1 rounded-full font-black uppercase">Cặp số A{idx+1}</span>
                      </div>
                   </div>
                ))}
              </div>
              <div className="space-y-6">
                <h4 className="text-2xl font-black text-lumitel-blue flex items-center gap-3 px-4 uppercase italic"><span className="w-4 h-4 bg-lumitel-yellow rounded-full"></span> BẢNG B</h4>
                {data.pairs.filter(p => p.groupId === 'B').map((pair, idx) => (
                   <div key={pair.id} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-transparent hover:border-lumitel-blue transition-all group">
                      <input
                        type="text"
                        value={pair.name}
                        onChange={(e) => updatePairName(pair.id, e.target.value)}
                        className="w-full text-2xl font-black text-lumitel-blue bg-transparent border-none focus:ring-0 uppercase italic tracking-tighter"
                      />
                      <div className="mt-4 flex gap-2">
                        <span className="text-[10px] bg-blue-50 text-lumitel-blue px-3 py-1 rounded-full font-black uppercase">Cặp số B{idx+1}</span>
                      </div>
                   </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-10">
              <button 
                onClick={createGroupMatches}
                className="bg-lumitel-blue text-white px-14 py-7 rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-blue-800 transition-all uppercase italic"
              >
                KHỞI TẠO LỊCH THI ĐẤU ➔
              </button>
            </div>
          </div>
        )}

        {/* GROUP STAGE */}
        {activeTab === 'group' && data && data.matches.length > 0 && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <StandingTable title="BẢNG XẾP HẠNG A 🥇" standings={standingsA} />
              <StandingTable title="BẢNG XẾP HẠNG B 🥇" standings={standingsB} />
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black text-lumitel-blue border-b-8 border-lumitel-yellow inline-block pb-2 uppercase italic">📅 LỊCH THI ĐẤU VÒNG BẢNG</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.matches.filter(m => m.stage.startsWith('GROUP')).map(m => (
                  <MatchCard 
                    key={m.id} match={m} 
                    pairA={data.pairs.find(p => p.id === m.pairAId)!} 
                    pairB={data.pairs.find(p => p.id === m.pairBId)!} 
                    onUpdateScore={updateMatchScore}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={generateKnockout} className="bg-lumitel-yellow text-lumitel-blue px-12 py-6 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 transition-all border-4 border-lumitel-blue uppercase italic">
                TIẾN VÀO BÁN KẾT ➔
              </button>
            </div>
          </div>
        )}

        {/* KNOCKOUT STAGE */}
        {activeTab === 'knockout' && data && data.matches.length > 0 && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-lumitel-blue text-center uppercase italic border-b-4 border-gray-100 pb-4">⚡ VÒNG BÁN KẾT</h3>
                {data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL).map(m => (
                  <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                ))}
                <div className="flex justify-center">
                   <button onClick={generateFinals} className="bg-lumitel-blue text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-800 transition-all uppercase italic">XÁC NHẬN CHUNG KẾT ➔</button>
                </div>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-lumitel-yellow bg-lumitel-blue p-5 rounded-3xl text-center uppercase italic shadow-2xl animate-pulse border-4 border-lumitel-yellow">🏆 TRẬN CHUNG KẾT</h3>
                  {data.matches.filter(m => m.stage === MatchStage.FINAL).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
                <div className="space-y-8 opacity-70">
                  <h3 className="text-2xl font-black text-gray-500 text-center uppercase italic">🥉 TRANH HẠNG 3</h3>
                  {data.matches.filter(m => m.stage === MatchStage.THIRD_PLACE).map(m => (
                    <MatchCard key={m.id} match={m} pairA={data.pairs.find(p => p.id === m.pairAId)!} pairB={data.pairs.find(p => p.id === m.pairBId)!} onUpdateScore={updateMatchScore} />
                  ))}
                </div>
              </div>
            </div>

            {/* CHAMPION BANNER */}
            {data.matches.find(m => m.id === 'm-final')?.isCompleted && (
              <div className="bg-gradient-to-br from-lumitel-blue via-blue-900 to-black rounded-[4rem] p-16 text-center text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-b-[15px] border-lumitel-yellow max-w-5xl mx-auto relative overflow-hidden mt-20">
                <div className="absolute inset-0 bg-white/5 opacity-10"></div>
                <h2 className="text-5xl font-black mb-10 tracking-[0.2em] uppercase italic relative z-10">👑 NHÀ VÔ ĐỊCH 👑</h2>
                <div className="relative inline-block mb-12 z-10 scale-125">
                  <p className="text-7xl md:text-8xl font-black text-lumitel-yellow drop-shadow-[0_10px_30px_rgba(255,226,0,0.5)] uppercase italic tracking-tighter">
                    {data.pairs.find(p => p.id === data.matches.find(m => m.id === 'm-final')?.winnerId)?.name}
                  </p>
                </div>
                <div className="mt-14 text-7xl animate-pulse">🎊 🏆 🎊</div>
              </div>
            )}
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-lumitel-blue mb-10 border-b-8 border-lumitel-yellow inline-block uppercase italic">THỂ LỆ GIẢI ĐẤU</h2>
            <div className="space-y-8 text-lg font-bold">
              <div className="bg-gray-50 p-6 rounded-3xl border-l-[10px] border-lumitel-blue">
                <h4 className="text-2xl font-black text-lumitel-blue mb-2">1. Thể thức vòng bảng</h4>
                <p>Chia 2 bảng A & B. Đấu vòng tròn 1 lượt. Chọn 2 đội Nhất, Nhì mỗi bảng vào Bán kết.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border-l-[10px] border-lumitel-yellow">
                <h4 className="text-2xl font-black text-lumitel-blue mb-2">2. Điểm số</h4>
                <p>Vòng bảng: Chạm 11. Bán kết & Chung kết: Chạm 15. Tất cả áp dụng luật Win-by-two (thắng cách 2 điểm).</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border-l-[10px] border-lumitel-blue">
                <h4 className="text-2xl font-black text-lumitel-blue mb-2">3. Xếp hạng</h4>
                <p>Ưu tiên: Số trận thắng ➔ Hiệu số điểm ➔ Tổng điểm ➔ Đối đầu trực tiếp.</p>
              </div>
              <div className="mt-10 flex justify-end">
                <button onClick={resetTournament} className="text-red-500 text-sm font-black hover:underline uppercase italic flex items-center gap-2">
                  <span>⚠️</span> Xóa toàn bộ dữ liệu & Reset giải đấu
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER BRANDING */}
      <footer className="fixed bottom-0 w-full bg-lumitel-blue text-white py-4 px-8 flex justify-between items-center z-40 border-t-4 border-lumitel-yellow shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-lumitel-yellow text-lumitel-blue w-10 h-10 rounded-xl flex items-center justify-center font-black">10</div>
          <span className="font-black tracking-tight uppercase italic hidden sm:inline">Lumitel Burundi - 10 Years of Excellence</span>
          <span className="font-black tracking-tight uppercase italic sm:hidden">Lumitel 10 Years</span>
        </div>
        <div className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-full uppercase tracking-widest border border-white/10 shadow-lg">
          Powered by Hoi Bu Kieu Burundi
        </div>
      </footer>
    </div>
  );
};

export default App;
