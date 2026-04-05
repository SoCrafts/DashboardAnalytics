import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Calendar, Activity } from "lucide-react";

interface DatasetStatsProps {
  hasData: boolean;
  totalRows: number;
  createdAt: string;
  loading?: boolean;
}

export function DatasetStats({ hasData, totalRows, createdAt, loading }: DatasetStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-100 shadow-sm bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Status Card */}
      <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md bg-white overflow-hidden group">
        <div className={`h-1 w-full ${hasData ? "bg-emerald-500" : "bg-amber-500"}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</CardTitle>
          <Activity className={`h-4 w-4 ${hasData ? "text-emerald-500" : "text-amber-500"}`} />
        </CardHeader>
        <CardContent>
          <div className="mt-1">
            <Badge 
              variant={hasData ? "default" : "secondary"} 
              className={`font-black px-3 py-0.5 rounded-full border-none ${
                hasData 
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-amber-100 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {hasData ? "DATA READY" : "EMPTY"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            {hasData ? "Dataset is processed and ready" : "Awaiting data import"}
          </p>
        </CardContent>
      </Card>

      {/* Row Count Card */}
      <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md bg-white overflow-hidden group">
        <div className="h-1 w-full bg-indigo-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Rows</CardTitle>
          <Database className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 leading-none tabular-nums">
            {totalRows.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">Total records across all columns</p>
        </CardContent>
      </Card>

      {/* Created Card */}
      <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md bg-white overflow-hidden group">
        <div className="h-1 w-full bg-purple-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Created</CardTitle>
          <Calendar className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-slate-900">
            {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">Imported into the system</p>
        </CardContent>
      </Card>
    </div>
  );
}
