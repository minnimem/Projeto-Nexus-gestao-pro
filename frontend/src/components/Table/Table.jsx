import "./Table.css";

import { EMPTY_MESSAGES } from "../../constants/uiMessages";

export function Table({ columns, emptyMessage = EMPTY_MESSAGES.default, getRowKey, rows }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="ui-table-empty" colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row) : row.id index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
