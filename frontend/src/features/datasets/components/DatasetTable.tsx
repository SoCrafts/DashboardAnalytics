import React from 'react';

interface DatasetTableProps {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  totalRows: number;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ columns, rows, totalRows }) => {
  if (!columns || columns.length === 0 || rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-100">
        No rows found in this dataset.
      </div>
    );
  }

  const renderCell = (cellData: any) => {
    // Handle both new {value, raw} structure and legacy flat structure
    const value = cellData && typeof cellData === 'object' && 'value' in cellData ? cellData.value : cellData;
    const raw = cellData && typeof cellData === 'object' && 'raw' in cellData ? cellData.raw : undefined;

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }

    const valueStr = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
    const isClickable = raw !== undefined && raw !== null && String(value) !== String(raw);

    return (
      <div 
        className={`${isClickable ? 'cursor-help border-b border-dashed border-primary/40' : ''}`}
        title={isClickable ? `Original: ${raw}` : undefined}
        onClick={() => {
          if (isClickable) {
            alert(`Original value: ${raw}`);
          }
        }}
      >
        {valueStr}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.name}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.name}
                <span className="ml-2 lowercase font-normal opacity-60">({col.type || (col as any).dataType})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {renderCell(row[col.name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalRows > rows.length && (
        <div className="px-6 py-3 text-sm text-gray-500 text-center bg-gray-50 border-t border-gray-200">
          Showing first {rows.length} of {totalRows} rows.
        </div>
      )}
    </div>
  );
};
