import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DatasetCardProps {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;

  // 🔥 optional future props
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
  const date = new Date(createdAt).toLocaleDateString();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 🔥 prevents navigation
    if (confirm("Delete this dataset?")) {
      onDelete(id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/datasets/${id}`)}
      className="group cursor-pointer bg-white p-5 rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* TOP */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Created {date}
          </p>
        </div>

        {/* DELETE */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-red-50 text-red-500"
        >
          {isDeleting ? (
            <span className="text-xs">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {description || "No description provided"}
      </p>

      {/* FOOTER / META */}
      <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
        <span>
          {rowCount > 0 ? `${rowCount} rows` : "No data"}
        </span>

        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${rowCount > 0
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {rowCount > 0 ? "Ready" : "Empty"}
        </span>
      </div>
    </div>
  );
};