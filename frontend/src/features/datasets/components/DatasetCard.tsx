import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Database } from "lucide-react";

interface DatasetCardProps {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  rowCount?: number;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  id,
  name,
  description,
  createdAt,
  onDelete,
  isDeleting,
  rowCount = 0
}) => {
  const navigate = useNavigate();
  const date = new Date(createdAt).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this dataset?")) {
      onDelete(id);
    }
  };

  return (
    <Card 
      onClick={() => navigate({ to: `/datasets/${id}` })}
      className="group cursor-pointer border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {name}
            </CardTitle>
            <div className="flex items-center text-xs text-slate-400 font-medium gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>Created {date}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {description || "No description provided for this dataset project."}
        </p>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-slate-50/50 flex justify-between items-center py-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Database className="h-3.5 w-3.5 text-indigo-400" />
          <span>{rowCount > 0 ? `${rowCount.toLocaleString()} rows` : "No data"}</span>
        </div>
        
        <Badge 
          variant={rowCount > 0 ? "default" : "secondary"} 
          className={`font-bold px-2.5 py-0.5 rounded-full border-none ${
            rowCount > 0 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
          }`}
        >
          {rowCount > 0 ? "READY" : "EMPTY"}
        </Badge>
      </CardFooter>
    </Card>
  );
};