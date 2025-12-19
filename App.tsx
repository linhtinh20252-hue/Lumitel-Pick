
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

    setData(prev => ({
      ...prev!,
      pairs: newPairs,
      matches: [] 
    }));
  };

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

  const createGroupMatches = () => {
    if (!data) return;
    const groupA = data.pairs.filter(p => p.groupId === 'A');
    const groupB = data.pairs.filter(p => p.groupId === 'B');

    if (groupA.length < 4 || groupB.length < 4) {
      alert("Vui lòng đảm bảo có đủ 8 cặp đấu!");
      return;
    }

    const matches: Match[] = [];

    GROUP_MATCH_TEMPLATE.forEach((t, i) => {
      matches.push({
        id: `ga-${i}`,
        stage: MatchStage.GROUP_A,
        pairAId: groupA[t.p1].id,
        pairBId: groupA[t.p2].id,
        scoreA: null,
        scoreB: null,
        winnerId: null,
        isCompleted: false,
        label: `Bảng A: Trận ${i + 1}`,
        targetScore: data.config.pointsToWinGroup
      });
    });

    GROUP_MATCH_TEMPLATE.forEach((t, i) => {
      matches.push({
        id: `gb-${i}`,
        stage: MatchStage.GROUP_B,
        pairAId: groupB[t.p1].id,
        pairBId: groupB[t.p2].id,
        scoreA: null,
        scoreB: null,
        winnerId: null,
        isCompleted: false,
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
        matches: prev.matches.map(m => {
          if (m.id !== matchId) return m;
          return {
            ...m,
            scoreA,
            scoreB,
            winnerId: scoreA > scoreB ? m.pairAId : m.pairBId,
            isCompleted: true
          };
        })
      };
    });
  };

  const resetTournament = () => {
    if (confirm("Bạn có chắc chắn muốn xoá toàn bộ dữ liệu và bắt đầu lại?")) {
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
    const sA = standingsA;
    const sB = standingsB;

    if (sA.length < 2 || sB.length < 2) return;

    const sf1: Match = {
      id: 'sf-1',
      stage: MatchStage.SEMI_FINAL,
      pairAId: sA[0].pairId,
      pairBId: sB[1].pairId,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isCompleted: false,
      label: 'Bán Kết 1 (Nhất A vs Nhì B)',
      targetScore: data.config.pointsToWinKnockout
    };

    const sf2: Match = {
      id: 'sf-2',
      stage: MatchStage.SEMI_FINAL,
      pairAId: sB[0].pairId,
      pairBId: sA[1].pairId,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isCompleted: false,
      label: 'Bán Kết 2 (Nhất B vs Nhì A)',
      targetScore: data.config.pointsToWinKnockout
    };

    setData(prev => prev ? ({
      ...prev,
      matches: [...prev.matches.filter(m => m.stage === MatchStage.GROUP_A || m.stage === MatchStage.GROUP_B), sf1, sf2]
    }) : null);
    setActiveTab('knockout');
  };

  const generateFinals = () => {
    if (!data) return;
    const sfMatches = data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL);
    if (sfMatches.some(m => !m.isCompleted)) {
      alert("Vui lòng nhập đầy đủ kết quả Bán kết!");
      return;
    }

    const m1 = sfMatches.find(m => m.id === 'sf-1');
    const m2 = sfMatches.find(m => m.id === 'sf-2');

    if (!m1 || !m2) return;

    const winnerSF1 = m1.winnerId;
    const loserSF1 = m1.winnerId === m1.pairAId ? m1.pairBId : m1.pairAId;
    
    const winnerSF2 = m2.winnerId;
    const loserSF2 = m2.winnerId === m2.pairAId ? m2.pairBId : m2.pairAId;

    if (!winnerSF1 || !winnerSF2 || !loserSF1 || !loserSF2) return;

    const third: Match = {
      id: 'm-third',
      stage: MatchStage.THIRD_PLACE,
      pairAId: loserSF1,
      pairBId: loserSF2,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isCompleted: false,
      label: 'Tranh Hạng 3',
      targetScore: data.config.pointsToWinKnockout
    };

    const final: Match = {
      id: 'm-final',
      stage: MatchStage.FINAL,
      pairAId: winnerSF1,
      pairBId: winnerSF2,
      scoreA: null,
      scoreB: null,
      winnerId: null,
      isCompleted: false,
      label: 'Chung Kết',
      targetScore: data.config.pointsToWinKnockout
    };

    setData(prev => prev ? ({
      ...prev,
      matches: [...prev.matches.filter(m => m.stage !== MatchStage.FINAL && m.stage !== MatchStage.THIRD_PLACE), third, final]
    }) : null);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 selection:bg-lumitel-yellow selection:text-lumitel-blue">
      {/* Header Banner */}
      <header className="bg-lumitel-blue text-white overflow-hidden relative shadow-2xl border-b-4 border-lumitel-yellow">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="z-10 text-center md:text-left">
            <h4 className="font-extrabold text-xl uppercase tracking-[0.3em] mb-2 text-lumitel-yellow italic drop-shadow-md">HỘI BU KIỀU BURUNDI</h4>
            <h1 className="text-5xl md:text-6xl font-black mb-3 leading-tight tracking-tighter uppercase italic">KỶ NIỆM 10 NĂM <br/>LUMITEL BURUNDI</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
               <span className="bg-lumitel-yellow text-lumitel-blue px-5 py-1.5 rounded-full text-sm font-black shadow-lg transform hover:scale-110 transition-transform">HÀ NỘI - 2025</span>
               <span className="bg-white/10 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-sm font-black border border-white/20 shadow-lg">PICKLEBALL OPEN 🎾</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-64 h-64 bg-white rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-lumitel-yellow transform rotate-2 hover:rotate-0 transition-all duration-500 overflow-hidden flex items-center justify-center relative group">
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <img 
                  src={`data:image/png;base64,${LOGO_BASE64}`} 
                  alt="Hội Bu Kiều Official Logo" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    console.error("Logo failed to load");
                    // Show a fallback if base64 is somehow corrupted
                    (e.target as any).src = "https://ui-avatars.com/api/?name=Hoi+Bu+Kieu&background=005696&color=FFE200&size=256";
                  }}
                />
             </div>
             {/* Decorative Pickleball Accents */}
             <div className="absolute -top-10 -right-10 text-6xl animate-bounce drop-shadow-2xl select-none">🎾</div>
             <div className="absolute -bottom-6 -left-12 text-5xl animate-pulse delay-700 drop-shadow-2xl select-none opacity-80">🏸</div>
             <div className="absolute top-1/2 -left-20 text-3xl animate-ping opacity-40 select-none">✨</div>
          </div>
        </div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lumitel-yellow/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-lumitel-yellow rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse"></div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center space-x-1 md:space-x-4 overflow-x-auto no-scrollbar py-3">
            {[
              { id: 'athletes', label: 'Danh Sách VĐV' },
              { id: 'pairs', label: 'Cặp Thi Đấu' },
              { id: 'group', label: 'Vòng Bảng' },
              { id: 'knockout', label: 'Vòng Loại' },
              { id: 'rules', label: 'Thể Lệ' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 text-sm font-black transition-all whitespace-nowrap rounded-xl border-b-4 ${
                  activeTab === tab.id 
                  ? 'bg-lumitel-blue text-white shadow-lg scale-105 border-blue-900' 
                  : 'text-gray-500 hover:text-lumitel-blue hover:bg-blue-50 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {activeTab === 'rules' && (
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-3xl mx-auto border border-gray-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 text-[15rem] rotate-12 select-none">🎾</div>
            <h2 className="text-4xl font-black text-lumitel-blue mb-8 border-b-8 border-lumitel-yellow inline-block uppercase italic tracking-tighter">
               THỂ LỆ GIẢI ĐẤU 📜
            </h2>
            <div className="space-y-8 text-gray-800 font-bold relative z-10 leading-relaxed">
              <section className="bg-gray-50 p-6 rounded-3xl border-l-[12px] border-lumitel-blue shadow-sm">
                <h3 className="text-2xl font-black flex items-center gap-3 mb-3 text-lumitel-blue">
                  <span className="bg-lumitel-yellow text-lumitel-blue px-3 py-1 rounded-xl font-black text-lg shadow-sm">I</span> ĐỐI TƯỢNG THAM GIA
                </h3>
                <p className="text-lg">16 vận động viên từ Hội Bu Kiều Burundi chia thành 8 cặp thi đấu giao lưu kỷ niệm 10 năm Lumitel.</p>
              </section>
              <section className="bg-gray-50 p-6 rounded-3xl border-l-[12px] border-lumitel-yellow shadow-sm">
                <h3 className="text-2xl font-black flex items-center gap-3 mb-3 text-lumitel-blue">
                  <span className="bg-lumitel-blue text-white px-3 py-1 rounded-xl font-black text-lg shadow-sm">II</span> HÌNH THỨC THI ĐẤU
                </h3>
                <p className="text-lg">Chia 2 bảng A & B. Mỗi bảng 4 cặp. Thi đấu vòng tròn 1 lượt. Chọn 2 cặp Nhất - Nhì mỗi bảng vào vòng Bán Kết.</p>
              </section>
              <section className="bg-gray-50 p-6 rounded-3xl border-l-[12px] border-lumitel-blue shadow-sm">
                <h3 className="text-2xl font-black flex items-center gap-3 mb-3 text-lumitel-blue">
                  <span className="bg-lumitel-yellow text-lumitel-blue px-3 py-1 rounded-xl font-black text-lg shadow-sm">III</span> CÁCH TÍNH ĐIỂM XẾP HẠNG
                </h3>
                <ul className="list-disc ml-8 space-y-2 text-lg">
                  <li>Thắng: <span className="text-green-600 font-black">1 điểm</span> | Thua: <span className="text-red-600 font-black">0 điểm</span>.</li>
                  <li>Ưu tiên: Số trận thắng -> Hiệu số điểm -> Tổng điểm ghi -> Đối đầu -> Bốc thăm.</li>
                </ul>
              </section>
              <section className="bg-blue-50 p-6 rounded-3xl border-l-[12px] border-lumitel-blue shadow-md transform hover:scale-[1.02] transition-transform">
                <h3 className="text-2xl font-black flex items-center gap-3 mb-3 text-lumitel-blue">
                  <span className="bg-lumitel-blue text-white px-3 py-1 rounded-xl font-black text-lg shadow-sm">IV</span> ĐIỂM SỐ & LUẬT CHƠI 🎾
                </h3>
                <ul className="list-disc ml-8 space-y-3 text-lg">
                  <li className="font-black text-lumitel-blue">Vòng Bảng: Chạm 11 điểm (Phải hơn 2 điểm).</li>
                  <li className="font-black text-orange-600">Bán Kết & Chung Kết: Chạm 15 điểm (Phải hơn 2 điểm).</li>
                  <li>Đổi sân khi một đội đạt mốc 6 điểm (trận 11) hoặc 8 điểm (trận 15).</li>
                </ul>
              </section>
            </div>
            <div className="mt-16 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
              <button onClick={resetTournament} className="text-red-500 text-sm font-black hover:underline italic flex items-center gap-2">
                <span>⚠️</span> Xoá toàn bộ dữ liệu & Đặt lại giải đấu
              </button>
            </div>
          </div>
        )}

        {activeTab === 'athletes' && data && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 text-[12rem] -rotate-12 select-none">🏸</div>
               <div className="flex justify-between items-center mb-10 border-b-2 border-gray-50 pb-6 relative z-10">
                  <div>
                    <h2 className="text-4xl font-black text-lumitel-blue uppercase italic tracking-tighter flex items-center gap-3">
                       DANH SÁCH VẬN ĐỘNG VIÊN
                    </h2>
                    <p className="text-gray-500 font-bold text-lg">Hội Bu Kiều Burundi - 2025</p>
                  </div>
                  <div className="bg-lumitel-yellow text-lumitel-blue px-6 py-3 rounded-2xl font-black text-2xl shadow-xl border-4 border-lumitel-blue animate-pulse">
                    {data.players.length} / 16
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                 {data.players.map((player, idx) => (
                   <div key={player.id} className="flex items-center gap-4 bg-gray-50 p-5 rounded-3xl border-2 border-transparent hover:border-lumitel-yellow hover:bg-white hover:shadow-xl transition-all group">
                     <span className="w-10 h-10 bg-lumitel-blue text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-all shadow-lg">
                       {idx + 1}
                     </span>
                     <input 
                       type="text" 
                       value={player.name}
                       onChange={(e) => updateAthleteName(player.id, e.target.value)}
                       className="w-full bg-transparent border-none focus:ring-0 font-black text-gray-900 text-xl placeholder-gray-300 uppercase italic tracking-tight"
                       placeholder={`Tên VĐV ${idx + 1}...`}
                     />
                   </div>
                 ))}
               </div>

               <div className="mt-14 flex justify-center relative z-10">
                  <button 
                    onClick={() => setActiveTab('pairs')}
                    className="bg-lumitel-blue text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-[0_15px_30px_rgba(0,86,150,0.3)] hover:bg-blue-800 hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-4 group uppercase italic"
                  >
                    <span>TIẾP THEO: CHIA CẶP NGẪU NHIÊN</span>
                    <span className="text-3xl group-hover:translate-x-3 transition-transform">🎾</span>
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'pairs' && data && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-lumitel-blue uppercase italic flex items-center justify-center md:justify-start gap-3">
                   <span className="text-4xl">🔀</span> QUẢN LÝ CẶP ĐẤU
                </h3>
                <p className="text-gray-500 text-lg font-bold">Xếp cặp ngẫu nhiên & Phân bảng A-B</p>
              </div>
              <button 
                onClick={generateRandomPairs}
                className="bg-lumitel-yellow text-lumitel-blue px-8 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-lumitel-blue flex items-center gap-3 uppercase italic"
              >
                <span>🔄</span> XÁO TRỘN CẶP NGẪU NHIÊN
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-lumitel-blue flex items-center gap-3 uppercase italic">
                  <span className="w-3 h-10 bg-lumitel-yellow rounded-full shadow-lg"></span>
                  BẢNG A 🏸
                </h2>
                {data.pairs.filter(p => p.groupId === 'A').map((pair, idx) => (
                  <div key={pair.id} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-gray-50 hover:border-lumitel-blue transition-all group relative overflow-hidden transform hover:-rotate-1">
                    <div className="absolute -top-4 -right-4 p-4 opacity-5 text-6xl group-hover:opacity-20 transition-all group-hover:rotate-12 select-none">🎾</div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-3 block tracking-[0.3em]">CẶP ĐẤU A{idx + 1}</label>
                    <input
                      type="text"
                      value={pair.name}
                      onChange={(e) => updatePairName(pair.id, e.target.value)}
                      className="w-full text-2xl font-black text-lumitel-blue bg-white border-b-4 border-gray-50 focus:border-lumitel-yellow outline-none transition-all pb-3 mb-3 uppercase italic tracking-tighter"
                    />
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-blue-50 text-lumitel-blue px-4 py-1.5 rounded-full font-black uppercase shadow-sm border border-blue-100">VĐV CHÍNH THỨC 🏸</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-lumitel-blue flex items-center gap-3 uppercase italic">
                  <span className="w-3 h-10 bg-lumitel-yellow rounded-full shadow-lg"></span>
                  BẢNG B 🏸
                </h2>
                {data.pairs.filter(p => p.groupId === 'B').map((pair, idx) => (
                  <div key={pair.id} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-gray-50 hover:border-lumitel-blue transition-all group relative overflow-hidden transform hover:rotate-1">
                    <div className="absolute -top-4 -right-4 p-4 opacity-5 text-6xl group-hover:opacity-20 transition-all group-hover:rotate-12 select-none">🎾</div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-3 block tracking-[0.3em]">CẶP ĐẤU B{idx + 1}</label>
                    <input
                      type="text"
                      value={pair.name}
                      onChange={(e) => updatePairName(pair.id, e.target.value)}
                      className="w-full text-2xl font-black text-lumitel-blue bg-white border-b-4 border-gray-50 focus:border-lumitel-yellow outline-none transition-all pb-3 mb-3 uppercase italic tracking-tighter"
                    />
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-blue-50 text-lumitel-blue px-4 py-1.5 rounded-full font-black uppercase shadow-sm border border-blue-100">VĐV CHÍNH THỨC 🏸</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 flex justify-center mt-12">
                <button 
                  onClick={createGroupMatches}
                  className="bg-lumitel-blue text-white px-14 py-7 rounded-3xl font-black text-2xl shadow-[0_20px_40px_rgba(0,86,150,0.3)] hover:bg-blue-800 hover:-translate-y-2 transition-all active:scale-95 uppercase italic tracking-tight"
                >
                  XÁC NHẬN & BẮT ĐẦU VÒNG BẢNG 🎾
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Placeholder for Empty Matches */}
        {(activeTab === 'group' || activeTab === 'knockout') && data && data.matches.length === 0 && (
           <div className="text-center py-24 bg-white rounded-[3rem] shadow-2xl border border-gray-50 max-w-2xl mx-auto">
              <div className="text-8xl mb-6 animate-pulse select-none">🎾</div>
              <p className="text-gray-400 font-black text-2xl mb-6 uppercase italic tracking-tighter">Vui lòng hoàn thành chia cặp đấu trước!</p>
              <button 
                onClick={() => setActiveTab('pairs')} 
                className="bg-lumitel-blue text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl uppercase italic"
              >
                ➔ QUAY LẠI CHIA CẶP
              </button>
           </div>
        )}

        {activeTab === 'group' && data && data.matches.length > 0 && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <StandingTable title="XẾP HẠNG BẢNG A 🥇" standings={standingsA} />
              <StandingTable title="XẾP HẠNG BẢNG B 🥇" standings={standingsB} />
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black text-lumitel-blue border-b-8 border-lumitel-yellow inline-block pb-2 uppercase italic flex items-center gap-4">
                <span className="text-3xl bg-lumitel-yellow p-2 rounded-xl shadow-md">📅</span> LỊCH THI ĐẤU VÒNG BẢNG (CHẠM 11)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.matches.filter(m => m.stage === MatchStage.GROUP_A || m.stage === MatchStage.GROUP_B).map(m => (
                  <MatchCard 
                    key={m.id} 
                    match={m} 
                    pairA={data.pairs.find(p => p.id === m.pairAId)!} 
                    pairB={data.pairs.find(p => p.id === m.pairBId)!} 
                    onUpdateScore={updateMatchScore}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-10 border-t-2 border-gray-100">
              <button 
                onClick={generateKnockout}
                className="bg-lumitel-yellow text-lumitel-blue px-14 py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-110 transition-all border-4 border-lumitel-blue uppercase italic"
              >
                TIẾN VÀO VÒNG BÁN KẾT 🎾
              </button>
            </div>
          </div>
        )}

        {activeTab === 'knockout' && data && data.matches.length > 0 && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 max-w-6xl mx-auto">
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-lumitel-blue text-center bg-white py-5 rounded-3xl shadow-xl uppercase italic flex items-center justify-center gap-4 border-2 border-gray-50">
                  <span className="text-3xl">⚡</span> VÒNG BÁN KẾT
                </h2>
                <div className="space-y-6">
                   {data.matches.filter(m => m.stage === MatchStage.SEMI_FINAL).map(m => (
                    <MatchCard 
                      key={m.id} 
                      match={m} 
                      pairA={data.pairs.find(p => p.id === m.pairAId)!} 
                      pairB={data.pairs.find(p => p.id === m.pairBId)!} 
                      onUpdateScore={updateMatchScore}
                    />
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                   <button 
                    onClick={generateFinals}
                    className="bg-lumitel-blue text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-blue-800 transition-all uppercase text-lg italic tracking-tight"
                  >
                    TẠO TRẬN CHUNG KẾT 🎾
                  </button>
                </div>
              </div>
              
              <div className="space-y-16">
                <div className="space-y-10">
                  <h2 className="text-3xl font-black text-lumitel-yellow text-center bg-lumitel-blue py-5 rounded-3xl shadow-2xl uppercase italic flex items-center justify-center gap-4 border-4 border-lumitel-yellow animate-pulse">
                    <span className="text-4xl">🏆</span> TRẬN CHUNG KẾT
                  </h2>
                  {data.matches.filter(m => m.stage === MatchStage.FINAL).map(m => (
                    <MatchCard 
                      key={m.id} 
                      match={m} 
                      pairA={data.pairs.find(p => p.id === m.pairAId)!} 
                      pairB={data.pairs.find(p => p.id === m.pairBId)!} 
                      onUpdateScore={updateMatchScore}
                    />
                  ))}
                </div>
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-gray-400 text-center uppercase tracking-[0.3em] border-b-4 border-gray-100 pb-4 flex items-center justify-center gap-4 italic">
                    <span className="text-2xl">🥉</span> TRANH HẠNG 3
                  </h2>
                  {data.matches.filter(m => m.stage === MatchStage.THIRD_PLACE).map(m => (
                    <MatchCard 
                      key={m.id} 
                      match={m} 
                      pairA={data.pairs.find(p => p.id === m.pairAId)!} 
                      pairB={data.pairs.find(p => p.id === m.pairBId)!} 
                      onUpdateScore={updateMatchScore}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Final Celebration Banner */}
            {data.matches.find(m => m.id === 'm-final')?.isCompleted && (
              <div className="bg-gradient-to-br from-lumitel-blue via-blue-900 to-black rounded-[4rem] p-16 text-center text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-b-[15px] border-lumitel-yellow max-w-5xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-10 -left-10 p-6 opacity-20 text-[15rem] rotate-12 select-none">🏆</div>
                <h2 className="text-5xl font-black mb-10 tracking-[0.2em] uppercase italic relative z-10 drop-shadow-2xl">
                   👑 NHÀ VÔ ĐỊCH 👑
                </h2>
                <div className="relative inline-block mb-12 z-10 scale-110">
                  <p className="text-7xl md:text-8xl font-black text-lumitel-yellow drop-shadow-[0_10px_30px_rgba(255,226,0,0.5)] uppercase italic tracking-tighter">
                    {data.pairs.find(p => p.id === data.matches.find(m => m.id === 'm-final')?.winnerId)?.name}
                  </p>
                  <div className="absolute -top-10 -right-16 animate-bounce text-7xl select-none">👑</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-2xl font-black relative z-10">
                  <div className="bg-white/5 px-10 py-8 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-2xl group transition-all">
                    <span className="text-gray-400 text-xs block mb-2 uppercase tracking-[0.4em] font-black group-hover:text-gray-300">Giải Nhì 🥈</span>
                    <p className="text-3xl italic tracking-tight">{data.pairs.find(p => p.id === (data.matches.find(m => m.id === 'm-final')?.winnerId === data.matches.find(m => m.id === 'm-final')?.pairAId ? data.matches.find(m => m.id === 'm-final')?.pairBId : data.matches.find(m => m.id === 'm-final')?.pairAId))?.name}</p>
                  </div>
                  <div className="bg-white/5 px-10 py-8 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-2xl group transition-all">
                    <span className="text-gray-400 text-xs block mb-2 uppercase tracking-[0.4em] font-black group-hover:text-gray-300">Giải Ba 🥉</span>
                    <p className="text-3xl italic tracking-tight">{data.pairs.find(p => p.id === data.matches.find(m => m.id === 'm-third')?.winnerId)?.name}</p>
                  </div>
                </div>
                <div className="mt-14 text-7xl animate-pulse">🎊 🎾 🎾 🎊</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 w-full bg-lumitel-blue text-white py-5 px-8 flex justify-between items-center z-40 border-t-4 border-lumitel-yellow shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-lumitel-yellow rounded-2xl flex items-center justify-center font-black text-lumitel-blue text-2xl shadow-inner transform rotate-3">10</div>
          <span className="font-black tracking-tighter text-lg uppercase italic">LUMITEL BURUNDI 🎾</span>
        </div>
        <div className="text-xs font-black opacity-80 uppercase tracking-[0.4em] hidden sm:block italic">DIGITAL FOR LIFE | HÀ NỘI 2025</div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full uppercase border border-white/10 shadow-lg">BUILD V1.7.0 PRO</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
