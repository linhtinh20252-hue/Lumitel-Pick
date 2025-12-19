import React from 'react';
import { Standing } from '../types';

interface StandingTableProps {
  title: string;
  standings: Standing[];
}

const StandingTable: React.FC<StandingTableProps> = ({ title, standings }) => {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-lumitel-blue px-4 py-3 md:px-6 md:py-5 flex items-center gap-2 md:gap-3">
        <div className="w-1.5 h-5 md:w-2 md:h-6 bg-lumitel-yellow rounded-full"></div>
        <h3 className="text-white font-black text-base md:text-xl uppercase italic tracking-wider">{title}</h3>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[320px]">
          <thead className="bg-gray-50 text-gray-400 text-[8px] md:text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 md:px-6 md:py-4 w-12 md:w-16">Hạng</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Cặp VĐV</th>
              <th className="px-2 py-3 md:px-6 md:py-4 text-center">T</th>
              <th className="px-2 py-3 md:px-6 md:py-4 text-center">B</th>
              <th className="px-2 py-3 md:px-6 md:py-4 text-center">HS</th>
              <th className="px-2 py-3 md:px-6 md:py-4 text-center">Đ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900 bg-white">
            {standings.map((s, idx) => (
              <tr key={s.pairId} className={`${idx < 2 ? 'bg-green-50/50' : 'bg-white'} transition-colors hover:bg-gray-50`}>
                <td className="px-3 py-3 md:px-6 md:py-4">
                  <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-sm ${idx === 0 ? 'bg-lumitel-yellow text-lumitel-blue' : idx === 1 ? 'bg-gray-200 text-gray-700' : 'bg-transparent text-gray-400'}`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-3 py-3 md:px-6 md:py-4 font-black text-lumitel-blue uppercase text-[10px] md:text-sm truncate max-w-[120px] md:max-w-none">{s.pairName}</td>
                <td className="px-2 py-3 md:px-6 md:py-4 text-center font-bold text-gray-700 text-xs md:text-base">{s.wins}</td>
                <td className="px-2 py-3 md:px-6 md:py-4 text-center font-bold text-gray-700 text-xs md:text-base">{s.losses}</td>
                <td className="px-2 py-3 md:px-6 md:py-4 text-center font-black text-gray-500 text-xs md:text-base">{s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff}</td>
                <td className="px-2 py-3 md:px-6 md:py-4 text-center">
                  <span className="font-black text-sm md:text-lg text-lumitel-blue">{s.wins}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Top 2 vào Bán Kết</span>
      </div>
    </div>
  );
};

export default StandingTable;
