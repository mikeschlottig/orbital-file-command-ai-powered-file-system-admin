import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Database, HardDrive, Activity } from 'lucide-react';
import { SystemStats } from '../../../worker/types';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export function SystemHealth({ stats }: { stats: SystemStats }) {
  const chartConfig = {
    value: { label: 'Files' }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-400">Total Index</CardTitle>
          <Database className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalFiles} Files</div>
          <p className="text-xs text-slate-500 mt-1">Simulated SQLite storage</p>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-400">Storage Size</CardTitle>
          <HardDrive className="w-4 h-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
          </div>
          <p className="text-xs text-slate-500 mt-1">Aggregated file metadata</p>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-slate-800 md:row-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400">Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.typeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 border-slate-800 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Execution Frequency</CardTitle>
          <Activity className="w-4 h-4 text-slate-500" />
        </CardHeader>
        <CardContent className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.recentActivity}>
              <XAxis dataKey="time" hide />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}