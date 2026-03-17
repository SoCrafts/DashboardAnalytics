import React from 'react';

interface DatasetCardProps {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  id,
  name,
  description,
  createdAt,
  onDelete,
  isDeleting
}) => {
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">Created on {date}</p>
        </div>
        <button
          onClick={() => onDelete(id)}
          disabled={isDeleting}
          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
          title="Delete Dataset"
          aria-label="Delete Dataset"
        >
          {isDeleting ? (
             <span className="text-sm">Deleting...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-gray-600 line-clamp-3">{description}</p>
    </div>
  );
};
