import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getDataset, uploadDataset } from "../api/datasetApi";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDataset = () => {
    if (!id) return;
    setLoading(true);
    getDataset(id)
      .then(setDataset)
      .catch((err) => {
        setError(err.message || "Failed to load dataset");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDataset();
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const res = await uploadDataset(id, file);
      setUploadSuccess(`Upload successful! Detected ${res.columnsDetected} columns and inserted ${res.rowsInserted} rows.`);
      await getDataset(id).then(setDataset);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err.message || "Failed to upload dataset");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dataset) return <div>Dataset not found</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/dashboard" style={{ display: "inline-block", marginBottom: "1rem" }}>&larr; Back to Dashboard</Link>
      <h1>{dataset.name}</h1>
      <p style={{ color: "#666" }}>{dataset.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.9rem", color: "#888" }}>
          Status: <strong>{dataset.status}</strong> 
          {dataset.hasData && ` | Rows: ${dataset.rowCount}`}
        </div>
        {dataset.hasData && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", cursor: uploading ? "not-allowed" : "pointer", background: uploading ? "#ccc" : "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
            {uploading ? "Uploading..." : "Upload New CSV"}
          </button>
        )}
      </div>
      <hr style={{ marginBottom: "2rem" }} />
      
      
      {uploadSuccess && <div style={{ padding: "1rem", background: "#d4edda", color: "#155724", marginBottom: "1rem", borderRadius: "4px" }}>{uploadSuccess}</div>}
      {uploadError && <div style={{ padding: "1rem", background: "#f8d7da", color: "#721c24", marginBottom: "1rem", borderRadius: "4px" }}>{uploadError}</div>}
      
      <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

      {!dataset.hasData ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f9f9f9", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "1rem" }}>No data uploaded yet</h2>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: uploading ? "not-allowed" : "pointer", background: uploading ? "#ccc" : "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      ) : (
        <div>
          <section style={{ marginBottom: "2rem", border: "1px solid #eee", background: "#fdfdfd", padding: "1.5rem", borderRadius: "8px" }}>
            <h2>Table Preview</h2>
            <p style={{ color: "#555" }}>Table view placeholder (Total rows: {dataset.rowCount})</p>
          </section>
          
          <section style={{ marginBottom: "2rem", border: "1px solid #eee", background: "#fdfdfd", padding: "1.5rem", borderRadius: "8px" }}>
            <h2>Metrics</h2>
            <p style={{ color: "#555" }}>Metrics placeholder</p>
          </section>
          
          <section style={{ border: "1px solid #eee", background: "#fdfdfd", padding: "1.5rem", borderRadius: "8px" }}>
            <h2>Charts</h2>
            <p style={{ color: "#555" }}>Charts placeholder</p>
          </section>
        </div>
      )}
    </div>
  );
}
