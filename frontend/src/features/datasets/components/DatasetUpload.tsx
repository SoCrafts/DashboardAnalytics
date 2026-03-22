import React, { useRef } from 'react';
import { useUploadDataset } from '../api/datasetApi';
import { Button } from "@/components/ui/button";
import { Loader2, FileUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDataset();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadStart) onUploadStart();

    try {
      const res = await uploadMutation.mutateAsync({ id: datasetId, file });
      onUploadSuccess(res.data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isUploading = uploadMutation.isPending;
  const error = uploadMutation.error;

  return (
    <div className="flex flex-col gap-3">
      <input 
        type="file" 
        accept=".csv,.xlsx,.xls" 
        ref={fileInputRef} 
        className="hidden"
        onChange={handleFileChange} 
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        size="lg"
        className="w-fit gap-2 font-bold shadow-md h-12 rounded-xl"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : "Upload Dataset (CSV/Excel)"}
      </Button>

      {error && (
        <Alert variant="destructive" className="max-w-md rounded-xl border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>
            {(error as any)?.response?.data?.message || error.message || "Failed to upload dataset"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
