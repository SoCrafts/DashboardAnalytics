import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface DatasetActionsProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  isPreviewing?: boolean;
  onConfirmImport?: () => void;
  onCancelPreview?: () => void;
  isImporting?: boolean;
}

export function DatasetActions({ 
  onFileSelect, 
  isProcessing, 
  isPreviewing, 
  onConfirmImport, 
  onCancelPreview,
  isImporting 
}: DatasetActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isPreviewing) {
    return (
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <Button 
          variant="default" 
          onClick={onConfirmImport} 
          disabled={isImporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 px-6 shadow-sm"
        >
          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Confirm Import
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancelPreview} 
          disabled={isImporting}
          className="gap-2 h-11 px-6"
        >
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        size="lg"
        className="gap-2 h-11 px-6 shadow-md shadow-indigo-100 transition-all hover:translate-y-[-1px]"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        {isProcessing ? "Analyzing..." : "Import Dataset"}
      </Button>
    </div>
  );
}
