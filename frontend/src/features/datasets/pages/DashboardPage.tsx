import React, { useState } from 'react';
import { 
  useDatasets, 
  useCreateDataset, 
  useDeleteDataset 
} from '../api/datasetApi';
import { DatasetCard } from '../components/DatasetCard';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Activity, 
  AlertCircle, 
  LayoutGrid, 
  PlusCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createDatasetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CreateDatasetValues = z.infer<typeof createDatasetSchema>;

export const DashboardPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const { data: datasets = [], isLoading, error } = useDatasets();
  const createMutation = useCreateDataset();
  const deleteMutation = useDeleteDataset();

  const form = useForm<CreateDatasetValues>({
    resolver: zodResolver(createDatasetSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateDatasetValues) => {
    try {
      await createMutation.mutateAsync({ 
        name: values.name, 
        description: values.description ?? "" 
      });
      setShowModal(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create dataset", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete dataset", err);
    }
  };

  const totalDatasets = datasets.length;
  const datasetsWithData = datasets.filter(d => d.rowCount > 0).length;
  const emptyDatasets = totalDatasets - datasetsWithData;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 font-medium text-lg">Central hub for your data assets and insights</p>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-indigo-200 gap-2">
              <PlusCircle className="h-5 w-5" />
              New Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">Create Dataset</DialogTitle>
              <DialogDescription>
                Start a new project by defining your dataset name and purpose.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-black text-slate-400 uppercase tracking-widest">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Sales Q1 2024"
                          className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional context about the data..."
                          className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="w-full rounded-xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700"
                  >
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initialize Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <div className="h-1 w-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Datasets</CardTitle>
            <LayoutGrid className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-12" /> : <div className="text-3xl font-black text-slate-900">{totalDatasets}</div>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <div className="h-1 w-full bg-slate-100 group-hover:bg-emerald-500 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Assets</CardTitle>
            <Activity className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-12" /> : <div className="text-3xl font-black text-slate-900">{datasetsWithData}</div>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <div className="h-1 w-full bg-slate-100 group-hover:bg-amber-500 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Upload</CardTitle>
            <Database className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-12" /> : <div className="text-3xl font-black text-slate-900">{emptyDatasets}</div>}
          </CardContent>
        </Card>
      </div>

      {/* ERROR STATE */}
      {error && (
        <Alert variant="destructive" className="mb-8 rounded-2xl border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Synchronization Error</AlertTitle>
          <AlertDescription>We couldn't reach the analytics server. Please refresh or check your connection.</AlertDescription>
        </Alert>
      )}

      {/* DATASET GRID */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-none shadow-sm h-48 rounded-2xl">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : datasets.length === 0 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Database className="h-10 w-10 text-slate-200" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Empty Workspace</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg">
            Ready to dive into data? Initialize your first dataset project to get started.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowModal(true)}
            className="rounded-xl px-10 h-12 font-bold bg-white hover:bg-slate-50 border-slate-200"
          >
            Start First Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {datasets.map(dataset => (
            <DatasetCard
              key={dataset.id}
              {...dataset}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};