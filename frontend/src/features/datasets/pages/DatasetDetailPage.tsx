import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { 
  useDataset, 
  useDatasetRows, 
  usePreviewDataset, 
  useUploadDataset,
  type PreviewResult
} from "../api/datasetApi";
import { DatasetHeader } from "../components/DatasetHeader";
import { DatasetActions } from "../components/DatasetActions";
import { DatasetStats } from "../components/DatasetStats";
import { DatasetMetrics } from "../components/DatasetMetrics";
import { DatasetContent } from "../components/DatasetContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function DatasetDetailPage() {
  const { id } = useParams({ from: '/datasets/$id' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [previewData, setPreviewData] = useState<PreviewResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: dataset, isLoading: isLoadingDataset, error: datasetError } = useDataset(id);
  const { data: rowData } = useDatasetRows(id, page, pageSize);
  
  const previewMutation = usePreviewDataset();
  const uploadMutation = useUploadDataset();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      const res = await previewMutation.mutateAsync({ id, file });
      setPreviewData(res.data);
      setPendingFile(file);
    } catch (err) {
      console.error("Preview failed", err);
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile || !id) return;

    try {
      const res = await uploadMutation.mutateAsync({ id, file: pendingFile });
      setSuccessMessage(`Successfully imported ${res.data.rowsInserted} rows.`);
      setPreviewData(null);
      setPendingFile(null);
      setPage(1);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setPendingFile(null);
  };

  if (isLoadingDataset && !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-pulse">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-4 w-full max-w-2xl">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-20 w-3/4 rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-48 rounded-2xl shrink-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-[2rem]" />
          <Skeleton className="h-40 rounded-[2rem]" />
          <Skeleton className="h-40 rounded-[2rem]" />
        </div>
        <Skeleton className="h-[600px] rounded-[3rem]" />
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-6">
        <Alert variant="destructive" className="rounded-[2.5rem] border-2 p-8 shadow-2xl shadow-red-500/10">
          <AlertCircle className="h-8 w-8 mb-4" />
          <AlertTitle className="text-2xl font-black tracking-tight mb-2">Retrieval Error</AlertTitle>
          <AlertDescription className="text-lg font-medium opacity-90 leading-relaxed">
            {((datasetError as any)?.response?.data?.message) || "We encountered a problem fetching your data. The asset may have been moved or permission was revoked."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-14 gap-8">
        <div className="flex-grow">
          <DatasetHeader name={dataset.name} description={dataset.description} />
        </div>
        <div className="shrink-0 pt-10 lg:pt-0">
          <DatasetActions 
            onFileSelect={handleFileSelect} 
            isProcessing={previewMutation.isPending}
            isPreviewing={!!previewData}
            onConfirmImport={handleConfirmUpload}
            onCancelPreview={handleCancelPreview}
            isImporting={uploadMutation.isPending}
          />
        </div>
      </div>

      {(successMessage || uploadMutation.error || previewMutation.error) && (
        <div className="mb-10 animate-in slide-in-from-top-6 duration-500 transition-all">
          {successMessage && (
            <Alert className="bg-emerald-50 border-emerald-100 text-emerald-800 rounded-[2rem] p-6 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <AlertTitle className="text-xl font-black tracking-tight mb-1">Import Finalized</AlertTitle>
              <AlertDescription className="text-lg font-medium opacity-90">{successMessage}</AlertDescription>
            </Alert>
          )}
          {(uploadMutation.error || previewMutation.error) && (
            <Alert variant="destructive" className="rounded-[2rem] border-2 p-6 shadow-lg shadow-red-500/5">
              <AlertCircle className="h-6 w-6" />
              <AlertTitle className="text-xl font-black tracking-tight mb-1">Process Halted</AlertTitle>
              <AlertDescription className="text-lg font-medium opacity-90">
                {((uploadMutation.error || previewMutation.error) as any)?.response?.data?.message || "Internal engine failure during processing."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <DatasetStats 
        hasData={dataset.hasData} 
        totalRows={rowData?.totalRows ?? dataset.rowCount} 
        createdAt={dataset.createdAt}
        loading={isLoadingDataset}
      />

      <div className="mt-12 space-y-16">
        {dataset.hasData && !previewData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <DatasetMetrics datasetId={dataset.id} />
          </div>
        )}

        <DatasetContent
          datasetId={dataset.id}
          previewData={previewData}
          rows={rowData?.rows ?? []}
          columns={rowData?.columns ?? dataset.columns}
          totalRows={rowData?.totalRows ?? 0}
          hasData={dataset.hasData}
          isProcessing={uploadMutation.isPending}
          onConfirmUpload={handleConfirmUpload}
          onCancelPreview={handleCancelPreview}
          onImportClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
