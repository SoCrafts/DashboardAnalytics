import React, { useRef, useState } from 'react';
import { uploadDataset } from '../api/datasetApi';

interface DatasetUploadProps {
  datasetId: string;
  onUploadSuccess: (data: { columnsDetected: number; rowsInserted: number }) => void;
  onUploadStart?: () => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ 
  datasetId, 
  onUploadSuccess,
  onUploadStart 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    if (onUploadStart) onUploadStart();

    try {
      const res = await uploadDataset(datasetId, file);
      onUploadSuccess(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to upload dataset");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input 
        type="file" 
        accept=".csv,.xlsx,.xls" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        onChange={handleFileChange} 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          fontWeight: 500,
          transition: "all 0.2s",
          cursor: uploading ? "not-allowed" : "pointer",
          background: uploading ? "var(--border)" : "var(--accent)",
          color: uploading ? "var(--text)" : "white",
          border: "none",
          width: "fit-content"
        }}
      >
        {uploading ? "Uploading..." : "Upload Dataset (CSV/Excel)"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>{error}</p>
      )}
    </div>
  );
};
