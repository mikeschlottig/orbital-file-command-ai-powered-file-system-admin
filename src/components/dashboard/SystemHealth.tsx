import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Database, HardDrive, Activity, Zap } from 'lucide-react';
import { SystemStats } from '../../../worker/types';
const ORBITAL_PALETTE = ['#3b82f6', '#06b6d4', '#6366f1', '#8b5cf6', '#34d399'];
export function SystemHealth({ stats }: { stats: SystemStats }) {
  const chartConfig = {
    value: { label: 'Object Count', color: '#3b82f6' }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-3">
            <CardTitle className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Core Index</CardTitle>
            <Database className="w-3.5 h-3.5 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-mono font-black text-white">{stats.totalFiles}</div>
            <div className="flex items-center gap-1 text-[9px] text-slate-600 mt-0.5">
              <Zap className="w-2.5 h-2.5 text-emerald-500" />
              <span>ACTIVE_RECORDS</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-3">
            <CardTitle className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Volume</CardTitle>
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-mono font-black text-white">
              {(stats.totalSize / (1024 * 1024)).toFixed(2)}<span className="text-[10px] text-slate-500 ml-1">MB</span>
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5 uppercase font-bold">Aggregate_Binary</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-slate-900/40 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-900/20">
          <CardTitle className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Class Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] p-0 flex items-center justify-center relative">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-slate-800/50 animate-pulse" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.typeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={8}
                dataKey="value"
                stroke="rgba(15,23,42,0.5)"
                strokeWidth={2}
              >
                {stats.typeDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={ORBITAL_PALETTE[index % ORBITAL_PALETTE.length]} 
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-slate-950 border-slate-800 font-mono text-[10px]" />} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/40 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-900/20 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-500" />
            Signal_Intensity
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[120px] p-0 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.recentActivity}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <ChartTooltip content={<ChartTooltipContent className="bg-slate-950 border-slate-800 font-mono" />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}