import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getDataset, getDatasetRows, previewDataset, uploadDataset } from "../api/datasetApi";
import { DatasetTable } from "../components/DatasetTable";

interface DatasetDetail {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  rowCount: number;
  hasData: boolean;
  status: string;
  columns: { name: string; type: string }[];
}

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalRows, setTotalRows] = useState(0);

  // Preview state
  const [previewData, setPreviewData] = useState<{ columns: any[], rows: any[] } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async (currentPage = page) => {
    if (!id) return;
    setLoading(true);
    try {
      const ds = await getDataset(id);
      setDataset(ds);
      
      if (ds.hasData) {
        const rowData = await getDatasetRows(id, currentPage, pageSize);
        setRows(rowData?.rows ?? []);
        setTotalRows(rowData?.totalRows ?? 0);
        setDataset(prev => prev ? { ...prev, columns: rowData?.columns ?? prev.columns } : null);
      } else {
        setRows([]);
        setTotalRows(0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load dataset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    setPage(1);
  }, [id]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData(newPage);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsProcessing(true);
    setError("");
    try {
      const res = await previewDataset(id, file);
      setPreviewData(res);
      setPendingFile(file);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to preview dataset");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile || !id) return;

    setIsProcessing(true);
    setError("");
    try {
      const res = await uploadDataset(id, pendingFile);
      setSuccessMessage(`Upload successful! Imported ${res.rowsInserted} rows.`);
      setPreviewData(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadData(1);
      setPage(1);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to upload dataset");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading && !dataset) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error && !previewData) return (
    <div className="p-8 text-center">
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 inline-block max-w-md">
        <p className="font-bold mb-2">Error</p>
        <p>{error}</p>
        <button onClick={() => setError("")} className="mt-4 text-primary underline">Dismiss</button>
      </div>
    </div>
  );

  if (!dataset) return <div className="p-8 text-center text-gray-500">Dataset not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <Link to="/dashboard" className="text-primary flex items-center gap-2 mb-4 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{dataset.name}</h1>
          <p className="text-gray-500 mt-1 max-w-2xl">{dataset.description}</p>
        </div>

        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv,.xlsx" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Import Data"}
          </button>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* PREVIEW MODE */}
      {previewData && (
        <div className="mb-12 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-blue-900">Batch Preview</h2>
              <p className="text-blue-700 text-sm">Review the first 50 rows before importing into the database.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCancelPreview}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmUpload}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {isProcessing ? "Importing..." : "Confirm & Import Data"}
              </button>
            </div>
          </div>
          
          <DatasetTable 
            columns={previewData.columns.map(c => ({ name: c.name, type: c.dataType }))} 
            rows={previewData.rows} 
            totalRows={previewData.rows.length} 
          />
        </div>
      )}

      {/* DATA VIEW */}
      {!previewData && (
        <div className="space-y-8">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dataset.hasData ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {dataset.hasData ? "DATA LOADED" : "EMPTY"}
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Row Count</p>
              <p className="text-2xl font-bold text-gray-900">{totalRows.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
              <p className="text-lg font-bold text-gray-900">{new Date(dataset.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {!dataset.hasData ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-24 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No data yet</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Upload a CSV or Excel file to begin analyzing your data.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Select File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-gray-900">Dataset Explorer</h2>
                <div className="text-sm text-gray-500">
                  Showing {rows.length} rows
                </div>
              </div>
              
              <DatasetTable 
                columns={dataset.columns} 
                rows={rows} 
                totalRows={totalRows} 
              />

              {/* PAGINATION */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  disabled={page === 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="text-sm font-medium text-gray-700">
                  Page <span className="text-primary">{page}</span> of {Math.ceil(totalRows / pageSize) || 1}
                </div>
                <button 
                  disabled={page >= Math.ceil(totalRows / pageSize) || loading}
                  onClick={() => handlePageChange(page + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
