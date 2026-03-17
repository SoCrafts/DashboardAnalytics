import React, { useEffect, useState } from 'react';
import { getDatasets, createDataset, deleteDataset } from '../api/datasetApi';
import { DatasetCard } from '../components/DatasetCard';

interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets', err);
      setError('Failed to load datasets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    try {
      setIsCreating(true);
      setCreateError(null);
      await createDataset({ name: newName, description: newDesc });
      setNewName('');
      setNewDesc('');
      await fetchDatasets();
    } catch (err) {
      console.error('Failed to create dataset', err);
      setCreateError('Failed to create dataset. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDataset(id);
      await fetchDatasets();
    } catch (err) {
      console.error('Failed to delete dataset', err);
      alert('Failed to delete dataset.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Datasets Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and view your data collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Datasets</h2>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          ) : datasets.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
              <p className="text-lg">No datasets found.</p>
              <p className="text-sm mt-2">Create one using the form to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {datasets.map(dataset => (
                <DatasetCard
                  key={dataset.id}
                  id={dataset.id}
                  name={dataset.name}
                  description={dataset.description}
                  createdAt={dataset.createdAt}
                  onDelete={handleDelete}
                  isDeleting={deletingId === dataset.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Form Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Dataset</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sales 2024"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your dataset..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              {createError && (
                <p className="text-red-500 text-sm">{createError}</p>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isCreating ? 'Creating...' : 'Create Dataset'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
