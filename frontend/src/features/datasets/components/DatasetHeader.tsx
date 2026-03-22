import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatasetHeaderProps {
  name: string;
  description: string;
}

export function DatasetHeader({ name, description }: DatasetHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
        <p className="text-slate-500 mt-1 text-lg max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  );
}
