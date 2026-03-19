import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDataset, getDatasetRows } from "../api/datasetApi";
import { DatasetUpload } from "../components/DatasetUpload";
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
  const [dataset, setDataset] = useState<DatasetDetail | null>({
    id: "",
    name: "",
    description: "",
    createdAt: new Date().toISOString(),
    rowCount: 0,
    hasData: false,
    status: "Loading",
    columns: []
  });
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const ds = await getDataset(id);
      setDataset({
        ...ds,
        columns: ds.columns ?? [] // default to empty array if undefined
      });
      if (ds.hasData) {
        const rowData = await getDatasetRows(id, 1, 50);
        setRows(rowData?.rows ?? []); // default to empty array
      } else {
        setRows([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load dataset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUploadSuccess = (res: { columnsDetected: number; rowsInserted: number }) => {
    setSuccessMessage(`Upload successful! Detected ${res.columnsDetected} columns and inserted ${res.rowsInserted} rows.`);
    loadData();
    // Clear message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ width: "3rem", height: "3rem", border: "2px solid var(--accent)", borderBottomColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1.5rem", borderRadius: "12px", display: "inline-block", border: "1px solid #fee2e2" }}>
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Error</p>
        <p>{error}</p>
        <Link to="/dashboard" style={{ color: "var(--accent)", textDecoration: "underline", marginTop: "1rem", display: "inline-block" }}>Back to Dashboard</Link>
      </div>
    </div>
  );

  if (!dataset) return <div style={{ padding: "2rem", textAlign: "center" }}>Dataset not found</div>;

  return (
    <div style={{ maxWidth: "1126px", margin: "0 auto", padding: "2rem 1rem", textAlign: "left" }}>
      <Link to="/dashboard" style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", textDecoration: "none" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: "1rem" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      <div style={{ background: "var(--bg)", borderRadius: "16px", border: "1px solid var(--border)", padding: "2rem", marginBottom: "2rem", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--text-h)", margin: "0 0 0.5rem 0" }}>{dataset.name}</h1>
            <p style={{ color: "var(--text)", maxWidth: "42rem", margin: 0 }}>{dataset.description}</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <DatasetUpload
              datasetId={dataset.id}
              onUploadSuccess={handleUploadSuccess}
              onUploadStart={() => setSuccessMessage("")}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", padding: "1.5rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", opacity: 0.7 }}>Status</span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.125rem 0.625rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              width: "fit-content",
              background: dataset.hasData ? "#dcfce7" : "#fef9c3",
              color: dataset.hasData ? "#166534" : "#854d0e"
            }}>
              {dataset.status}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", opacity: 0.7 }}>Total Rows</span>
            <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-h)" }}>{dataset.rowCount.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", opacity: 0.7 }}>Created At</span>
            <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-h)" }}>{new Date(dataset.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {successMessage && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "1.25rem", color: "#22c55e" }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {!dataset.hasData ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--social-bg)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
            <div style={{ margin: "0 auto", width: "4rem", height: "4rem", background: "var(--code-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "2rem", color: "var(--text)", opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-h)", marginBottom: "0.5rem" }}>Ready to upload your data?</h2>
            <p style={{ color: "var(--text)", marginBottom: "2rem", maxWidth: "28rem", marginInline: "auto" }}>Upload a CSV or Excel file to see your data analysis here. We'll automatically detect columns and data types.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-h)", margin: 0 }}>Data Preview</h2>
                <div style={{ fontSize: "0.875rem", color: "var(--text)", opacity: 0.7 }}>
                  Showing top {rows.length} rows
                </div>
              </div>
              <DatasetTable columns={dataset.columns} rows={rows} totalRows={dataset.rowCount} />
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              <section style={{ background: "var(--social-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-h)", marginBottom: "1rem", marginTop: 0 }}>Column Metadata</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {dataset.columns.map(col => (
                    <div key={col.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "var(--bg)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 500, color: "var(--text-h)" }}>{col.name}</span>
                      <span style={{ fontSize: "0.75rem", background: "var(--accent-bg)", color: "var(--accent)", padding: "0.25rem 0.5rem", borderRadius: "4px", textTransform: "capitalize" }}>{col.type}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ background: "var(--social-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: "3rem", height: "3rem", background: "var(--accent-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "var(--accent)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "1.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-h)", marginBottom: "0.5rem", marginTop: 0 }}>Metrics & Insights</h3>
                <p style={{ color: "var(--text)", fontSize: "0.875rem", margin: 0 }}>Automated metrics like distribution, outliers, and summary statistics will appear here soon.</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
