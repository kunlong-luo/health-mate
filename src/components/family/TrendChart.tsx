import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export function TrendChart({ trendData, selectedIndicator, onSelectIndicator }: { trendData: any[], selectedIndicator: string, onSelectIndicator: (ind: string) => void }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALT', 'AST', 'FPG', 'TC', 'TG', 'LDL-C'].map(ind => (
          <button 
            key={ind} 
            onClick={() => onSelectIndicator(ind)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${selectedIndicator === ind ? 'bg-[#5A5A40] text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
          >
            {ind}
          </button>
        ))}
      </div>
      
      {trendData.length > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="value" stroke="#5A5A40" strokeWidth={3} dot={{r: 4, fill: '#5A5A40'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400">
          <Activity size={32} className="mx-auto mb-3 opacity-50" />
          暂无该指标的趋势数据
        </div>
      )}
    </div>
  );
}
