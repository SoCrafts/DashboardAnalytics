import React from 'react';

interface DatasetTableProps {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  totalRows: number;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ columns, rows, totalRows }) => {
  if (!columns || columns.length === 0 || rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rows found in this dataset.
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg)" }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "var(--social-bg)" }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.name}
                style={{
                  padding: "0.75rem 1.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid var(--border)"
                }}
              >
                {col.name}
                <span style={{ marginLeft: "0.25rem", fontSize: "10px", color: "var(--text)", opacity: 0.6 }}>({col.type})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
              {columns.map((col) => (
                <td key={col.name} style={{ padding: "1rem 1.5rem", whiteSpace: "nowrap", fontSize: "0.875rem", color: "var(--text)" }}>
                  {formatValue(row[col.name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalRows > rows.length && (
        <div style={{ padding: "0.75rem", fontSize: "0.875rem", color: "var(--text)", textAlign: "center", background: "var(--social-bg)", opacity: 0.8 }}>
          Showing first {rows.length} of {totalRows} rows.
        </div>
      )}
    </div>
  );
};

function formatValue(val: any): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}
