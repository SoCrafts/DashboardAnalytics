import { useDatasetInsights } from "../api/datasetApi";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";

interface DatasetChartsProps {
  datasetId: string;
}

const COLORS = ["#4f46e5", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function DatasetCharts({ datasetId }: DatasetChartsProps) {
  const { data: insights, isLoading } = useDatasetInsights(datasetId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) return null;

  const { categorical, distributions, trends } = insights;
  const catEntries = Object.entries(categorical);
  const distEntries = Object.entries(distributions);
  const trendEntries = Object.entries(trends);

  if (catEntries.length === 0 && distEntries.length === 0 && trendEntries.length === 0) return null;

  return (
    <div className="space-y-8 mb-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorical Bar Charts */}
        {catEntries.map(([colName, data]) => (
          <Card key={`cat-${colName}`} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Distribution: {colName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(value: any) => [value, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Distribution (Histogram) Charts */}
        {distEntries.map(([colName, data]) => (
          <Card key={`dist-${colName}`} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Density: {colName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="range" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(value: any) => [value, 'Occurrences']}
                      labelFormatter={(label) => `Range: ${label}`}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Trend Line Charts */}
        {trendEntries.map(([colName, data]) => (
          <Card key={`trend-${colName}`} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-amber-500" />
                Trends: {colName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [Number(value).toFixed(2), 'Avg Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f59e0b" 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
