import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDataset } from "../api/datasetApi";

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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDataset(id)
      .then(setDataset)
      .catch((err) => {
        setError(err.message || "Failed to load dataset");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dataset) return <div>Dataset not found</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/dashboard" style={{ display: "inline-block", marginBottom: "1rem" }}>&larr; Back to Dashboard</Link>
      <h1>{dataset.name}</h1>
      <p style={{ color: "#666" }}>{dataset.description}</p>
      <div style={{ marginBottom: "2rem", fontSize: "0.9rem", color: "#888" }}>
        Status: <strong>{dataset.status}</strong> 
        {dataset.hasData && ` | Rows: ${dataset.rowCount}`}
      </div>
      <hr style={{ marginBottom: "2rem" }} />
      
      {!dataset.hasData ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f9f9f9", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "1rem" }}>No data uploaded yet</h2>
          <button style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            Upload CSV
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
