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

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const data = await getDatasets();
      setDatasets(data);
    } catch {
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
    if (!newName.trim()) return;

    try {
      setIsCreating(true);
      await createDataset({ name: newName, description: newDesc });
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      fetchDatasets();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDataset(id);
    fetchDatasets();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Datasets</h1>
          <p className="text-gray-500">Manage and analyze your data</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90"
        >
          + New Dataset
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl border">
          <p className="text-sm text-gray-500">Total Datasets</p>
          <p className="text-2xl font-bold">{datasets.length}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border">
          <p className="text-sm text-gray-500">With Data</p>
          <p className="text-2xl font-bold">
            {datasets.filter(d => (d as any).rowCount > 0).length}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border">
          <p className="text-sm text-gray-500">Empty</p>
          <p className="text-2xl font-bold">
            {datasets.filter(d => !(d as any).rowCount).length}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <p className="text-lg mb-2">No datasets yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-primary underline"
          >
            Create your first dataset
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map(dataset => (
            <DatasetCard
              key={dataset.id}
              {...dataset}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Dataset</h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border p-2 rounded"
              />

              <textarea
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};