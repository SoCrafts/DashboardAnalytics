import { DatasetTable } from "./DatasetTable";
import { DatasetCharts } from "./DatasetCharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, LayoutGrid, Table as TableIcon, FileSearch, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DatasetContentProps {
  datasetId: string;
  previewData: { columns: any[]; rows: any[] } | null;
  rows: any[];
  columns: { name: string; dataType: string }[];
  totalRows: number;
  hasData: boolean;
  isProcessing: boolean;
  onConfirmUpload: () => void;
  onCancelPreview: () => void;
  onImportClick: () => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DatasetContent({
  datasetId,
  previewData,
  rows,
  columns,
  totalRows,
  hasData,
  isProcessing,
  onConfirmUpload,
  onCancelPreview,
  onImportClick,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DatasetContentProps) {
  if (previewData) {
    return (
      <Card className="mb-12 border-indigo-100 bg-indigo-50/20 shadow-xl shadow-indigo-500/5 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-8 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-none px-3 font-black mb-3 uppercase tracking-widest text-[10px]">
                <FileSearch className="h-3 w-3 mr-1.5" />
                Draft Preview
              </Badge>
              <h2 className="text-3xl font-black text-indigo-900 tracking-tight">Stage Data</h2>
              <p className="text-indigo-700/70 font-medium">Reviewing the first 50 entries for structure and quality.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={onCancelPreview} className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl px-6 h-11">
                Discard
              </Button>
              <Button
                onClick={onConfirmUpload}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold shadow-lg shadow-indigo-200 rounded-xl h-11 transition-all hover:translate-y-[-1px]"
              >
                {isProcessing ? "Importing..." : "Finalize Import"}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-white shadow-sm">
            <DatasetTable
              columns={previewData.columns}
              rows={previewData.rows}
              totalRows={previewData.rows.length}
              page={1}
              pageSize={50}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
            />
          </div>
        </div>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-32 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="mx-auto w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
          <Upload className="h-10 w-10 text-slate-300 -rotate-3" />
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Knowledge Base Empty</h2>
        <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
          Unlock deep insights by importing your <span className="text-indigo-600 font-bold uppercase tracking-tighter">CSV</span> or <span className="text-indigo-600 font-bold uppercase tracking-tighter">Excel</span> assets.
        </p>
        <Button
          size="lg"
          onClick={onImportClick}
          className="rounded-2xl px-12 h-14 font-black shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 text-lg transition-all hover:scale-105"
        >
          Begin Import Flow
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Tabs defaultValue="visuals" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 group">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Intelligence Hub
              <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
            </h2>
            <p className="text-slate-500 font-medium text-lg">Multi-dimensional data analysis and exploration</p>
          </div>
          <TabsList className="bg-slate-100/80 backdrop-blur-sm p-1.5 h-auto rounded-2xl border border-slate-200 shadow-inner">
            <TabsTrigger 
              value="visuals" 
              className="rounded-xl gap-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md px-6 py-2.5 font-bold transition-all"
            >
              <LayoutGrid className="h-4.5 w-4.5" /> Visuals
            </TabsTrigger>
            <TabsTrigger 
              value="explorer" 
              className="rounded-xl gap-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md px-6 py-2.5 font-bold transition-all"
            >
              <TableIcon className="h-4.5 w-4.5" /> Explorer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visuals" className="mt-0 focus-visible:outline-none focus:outline-none">
          <DatasetCharts datasetId={datasetId} />
        </TabsContent>

        <TabsContent value="explorer" className="mt-0 focus-visible:outline-none focus:outline-none">
          <DatasetTable 
            columns={columns} 
            rows={rows} 
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
