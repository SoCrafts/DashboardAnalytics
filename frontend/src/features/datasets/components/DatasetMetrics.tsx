import { useDatasetMetrics } from "../api/datasetApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Hash, Calculator } from "lucide-react";

interface DatasetMetricsProps {
  datasetId: string;
}
function formatNumber(num: number, fractionDigits = 2): string {
  return Number(num)
    .toLocaleString('it-IT', { maximumFractionDigits: fractionDigits })
    .replace(/\u00A0/g, ' ');
}

function getFontSize(value: string, maxRem = 1.25, minRem = 0.75): string {
  const len = value.length;
  return `clamp(${minRem}rem, ${20 / len}rem, ${maxRem}rem)`;
}

export function DatasetMetrics({ datasetId }: DatasetMetricsProps) {
  const { data, isLoading, error } = useDatasetMetrics(datasetId);
  const metrics = data?.columns || [];

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-100 shadow-sm h-32">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex gap-4">
                  <div className="flex-1"><Skeleton className="h-8 w-full" /></div>
                  <div className="flex-1"><Skeleton className="h-8 w-full" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || metrics.length === 0) return null;

  return (
    <div className="mb-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Numeric Insights
          </h3>
          <p className="text-sm text-slate-500 font-medium">Automatic statistical computations</p>
        </div>
        <div className="h-px flex-grow mx-8 bg-slate-100 hidden md:block" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          Computed Live
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <Card key={m.name} className="border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group overflow-hidden bg-white">
            <div className="h-1.5 w-full bg-slate-50 group-hover:bg-indigo-500 transition-colors" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                    <TrendingUp className="h-3 w-3 text-slate-300" /> SUM
                  </p>
                  {(() => {
                    const formatted = formatNumber(m.sum, 1);
                    return (
                      <p
                        className="font-black text-slate-900 tabular-nums truncate"
                        title={formatted}
                        style={{ fontSize: getFontSize(formatted) }}
                      >
                        {formatted}
                      </p>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                    <TrendingUp className="h-3 w-3 rotate-45 text-slate-300" /> AVG
                  </p>
                  {(() => {
                    const formatted = formatNumber(m.avg, 2);
                    return (
                      <p
                        className="font-black text-indigo-600 tabular-nums truncate"
                        title={formatted}
                        style={{ fontSize: getFontSize(formatted) }}
                      >
                        {formatted}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Population
                </span>
                <span className="text-xs font-black text-slate-600 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 tabular-nums">
                  {m.count.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
